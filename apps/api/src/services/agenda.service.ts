import Issue from "../models/Issue.js";
import { IssueStatus } from "../models/Issue.js";
import { UserRole } from "../models/User.js";

export const RESCHEDULE_CUTOFF_HOURS = 2;

export type VisitAgendaStatus = "Programada" | "Vencida" | "En curso";

export interface AgendaVisit {
    id: string;
    sourceType: "issue";
    type: "Falla";
    scheduledAt: string;
    timeLabel: string;
    description: string;
    visitStatus: VisitAgendaStatus;
    machine: {
        id: string;
        code: string;
        name: string;
    };
    technician: { id: string; name: string } | null;
    reportedBy?: { id: string; name: string } | null;
}

const pad = (value: number) => value.toString().padStart(2, "0");

export const formatTimeLabel = (date: Date): string =>
    `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const getDayRange = (dateInput?: string) => {
    const base = dateInput ? new Date(`${dateInput}T00:00:00`) : new Date();

    const start = new Date(base);
    start.setHours(0, 0, 0, 0);

    const end = new Date(base);
    end.setHours(23, 59, 59, 999);

    return { start, end, dateKey: start.toISOString().slice(0, 10) };
};

export const canReschedule = (
    currentScheduledAt: Date | undefined,
    role: UserRole,
    ): { allowed: boolean; reason?: string } => {
    if (role === UserRole.ADMIN) return { allowed: true };
    if (!currentScheduledAt) return { allowed: true };

    const now = new Date();

    if (currentScheduledAt < now) return { allowed: true };

    const hoursUntil =
        (currentScheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil >= RESCHEDULE_CUTOFF_HOURS) return { allowed: true };

    return {
        allowed: false,
        reason: `Solo se puede reprogramar hasta ${RESCHEDULE_CUTOFF_HOURS} horas antes de la visita.`,
    };
    };

const getMachineInfo = (machine: any) => ({
    id: machine?._id?.toString() ?? "",
    code: machine?.internalTag || "S/T",
    name: machine?.catalogRef?.name || machine?.name || "Sin nombre",
});

const getVisitStatusForIssue = (issue: any): VisitAgendaStatus => {
    const scheduledAt = issue.scheduledAt ? new Date(issue.scheduledAt) : null;
    const now = new Date();

    if (
        issue.status === IssueStatus.DIAGNOSTICADO ||
        issue.status === IssueStatus.EN_REPARACION
    ) {
        return "En curso";
    }

    if (scheduledAt && scheduledAt < now) {
        return "Vencida";
    }

    return "Programada";
};

const mapIssueToVisit = (issue: any): AgendaVisit => {
    const scheduledAt = new Date(issue.scheduledAt);

    return {
    id: issue._id.toString(),
    sourceType: "issue",
    type: "Falla",
    scheduledAt: scheduledAt.toISOString(),
    timeLabel: formatTimeLabel(scheduledAt),
    description: issue.description,
    visitStatus: getVisitStatusForIssue(issue),
    machine: getMachineInfo(issue.machine),
    technician: issue.assignedTo
        ? { id: issue.assignedTo._id.toString(), name: issue.assignedTo.name }
        : null,
        reportedBy: issue.reportedBy
        ? { id: issue.reportedBy._id.toString(), name: issue.reportedBy.name }
        : null,
    };
    };

    const roleCanSeeVisit = (
    visit: AgendaVisit,
    user: { id: string; role: UserRole },
    ): boolean => {
    if (
        [UserRole.ADMIN, UserRole.MANTENIMIENTO, UserRole.GERENTE].includes(
        user.role,
        )
    ) {
        return true;
    }

    if (user.role === UserRole.TECNICO) {
        return visit.technician?.id === user.id;
    }

    if (user.role === UserRole.OPERARIO) {
        return visit.reportedBy?.id === user.id;
    }

    return false;
    };

    export const getAgendaForCompany = async (
    companyId: string,
    user: { id: string; role: UserRole },
    dateInput?: string,
    includeOverdue = true,
    ): Promise<{
    date: string;
    visits: AgendaVisit[];
    overdue: AgendaVisit[];
    }> => {
    const { start, end, dateKey } = getDayRange(dateInput);

    const issues = await Issue.find({
        company: companyId,
        status: { $ne: IssueStatus.CERRADO },
        assignedTo: { $exists: true, $ne: null },
        scheduledAt: { $exists: true, $ne: null },
    })
        .populate({ path: "machine", populate: { path: "catalogRef" } })
        .populate("assignedTo", "name")
        .populate("reportedBy", "name");
        const visits: AgendaVisit[] = [];
        const overdue: AgendaVisit[] = [];

        for (const issue of issues) {
            const visit = mapIssueToVisit(issue);

            if (!roleCanSeeVisit(visit, user)) continue;

            const scheduledAt = new Date(issue.scheduledAt!);

            if (scheduledAt >= start && scheduledAt <= end) {
            visits.push(visit);
            continue;
    }

    if (includeOverdue && visit.visitStatus === "Vencida") {
        overdue.push(visit);
        }
    }

    visits.sort(
        (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

    overdue.sort(
        (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

    return { date: dateKey, visits, overdue };
};

export const getOverdueVisitsForCompany = async (
    companyId: string,
    ): Promise<AgendaVisit[]> => {
    const now = new Date();

    const issues = await Issue.find({
        company: companyId,
        status: { $ne: IssueStatus.CERRADO },
        assignedTo: { $exists: true, $ne: null },
        scheduledAt: { $exists: true, $lt: now },
    })
        .populate({ path: "machine", populate: { path: "catalogRef" } })
        .populate("assignedTo", "name")
        .populate("reportedBy", "name");

    return issues.map(mapIssueToVisit);
};

export const getTodayVisitsForCompany = async (
    companyId: string,
    ): Promise<AgendaVisit[]> => {
    const { start, end } = getDayRange();

    const issues = await Issue.find({
        company: companyId,
        status: { $ne: IssueStatus.CERRADO },
        assignedTo: { $exists: true, $ne: null },
        scheduledAt: { $gte: start, $lte: end },
    })
        .populate({ path: "machine", populate: { path: "catalogRef" } })
        .populate("assignedTo", "name")
        .populate("reportedBy", "name");

    return issues.map(mapIssueToVisit).sort(
        (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
};