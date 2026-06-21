import Issue from "../models/Issue.js";
import { IssueStatus } from "../models/Issue.js";
import PreventiveMaintenance from "../models/PreventiveMaintenance.js";
import { PreventiveStatus } from "../models/PreventiveMaintenance.js";
import SparePartRequest from "../models/SparePartRequest.js";

export type HistoryTypeFilter = "all" | "fallas" | "mantenimiento";

export interface HistoryRecord {
    id: string;
    date: string;
    machine: {
        id: string;
        code: string;
        name: string;
    };
    type: "Falla" | "Mantenimiento";
    description: string;
    technician: { id: string; name: string } | null;
    status: string;
    usedSparePart: boolean;
    downtimeMinutes: number;
    detailType: "issue" | "preventive";
}

interface HistoryRecordInternal extends HistoryRecord {
    sortDate: Date;
}

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const getTechnician = (
    doc: any,
    ): { id: string; name: string } | null => {
    const tech = doc.conclusion?.finishedBy ?? doc.assignedTo;
    if (!tech || typeof tech !== "object" || !tech._id) return null;
    return { id: tech._id.toString(), name: tech.name };
};

const getMachineInfo = (machine: any) => {
    if (!machine || typeof machine !== "object") {
        return { id: "", code: "S/T", name: "Desconocida" };
    }
    return {
        id: machine._id?.toString() ?? "",
        code: machine.internalTag || "S/T",
        name: machine.catalogRef?.name || "Sin nombre",
    }; 
};

export const getMaintenanceHistory = async (
    companyId: string,
    type: HistoryTypeFilter = "all",
    page = 1,
    limit = 50,
    ): Promise<{
    total: number;
    page: number;
    limit: number;
    records: HistoryRecord[];
    }> => {
    const records: HistoryRecordInternal[] = [];

    const sparePartRequests = await SparePartRequest.find({ company: companyId });
    const issueSpareSet = new Set<string>();
    const preventiveSpareSet = new Set<string>();

    for (const request of sparePartRequests) {
        if (request.issue) issueSpareSet.add(request.issue.toString());
        if (request.preventive) preventiveSpareSet.add(request.preventive.toString());
    }

    if (type === "all" || type === "fallas") {
        const issues = await Issue.find({
        company: companyId,
        status: IssueStatus.CERRADO,
        })
        .populate({ path: "machine", populate: { path: "catalogRef" } })
        .populate("assignedTo", "name")
        .populate("conclusion.finishedBy", "name");

    for (const issue of issues) {
        const closedAt = issue.closedAt ?? issue.conclusion?.finishedAt;
        const createdAt = (issue as any).createdAt as Date | undefined;
        const sortDate = closedAt ?? createdAt ?? new Date();

    let downtimeMinutes = 0;
    if (closedAt && createdAt) {
        downtimeMinutes = Math.max(
            0,
            Math.round((closedAt.getTime() - createdAt.getTime()) / 60000),
        );
    }

    records.push({
        id: issue._id.toString(),
        date: formatDate(sortDate),
        sortDate,
        machine: getMachineInfo(issue.machine),
        type: "Falla",
        description: issue.description,
        technician: getTechnician(issue),
        status: "Resuelto",
        usedSparePart: issueSpareSet.has(issue._id.toString()),
        downtimeMinutes,
        detailType: "issue",
        });
    }
    }

    if (type === "all" || type === "mantenimiento") {
        const tasks = await PreventiveMaintenance.find({
        company: companyId,
        status: PreventiveStatus.REALIZADO,
        })
        .populate({ path: "machine", populate: { path: "catalogRef" } })
        .populate("assignedTo", "name")
        .populate("conclusion.finishedBy", "name");

    for (const task of tasks) {
        const sortDate =
        task.conclusion?.finishedAt ??
        task.lastDate ??
        (task as any).updatedAt ??
        new Date();

        records.push({
            id: task._id.toString(),
            date: formatDate(new Date(sortDate)),
            sortDate: new Date(sortDate),
            machine: getMachineInfo(task.machine),
            type: "Mantenimiento",
            description:
                task.conclusion?.description ||
                task.taskName ||
                task.description ||
                "Mantenimiento preventivo",
            technician: getTechnician(task),
            status: "Resuelto",
            usedSparePart: preventiveSpareSet.has(task._id.toString()),
            downtimeMinutes: 0,
            detailType: "preventive",
            });
        }
    }

    records.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

    const total = records.length;
    const start = (page - 1) * limit;
    const paginated = records.slice(start, start + limit).map(
        ({ sortDate: _sortDate, ...record }) => record,
    );

    return { total, page, limit, records: paginated };
};