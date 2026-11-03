import * as XLSX from 'xlsx';
import { Complaint, EvaluatedComplaint } from '@/types/complaint';
import { evaluateComplaint } from './urgency';

/**
 * Generates and downloads a rich, multi-tab Microsoft Excel (.xlsx) workbook
 * containing all campus complaints, priority calculations, student identity, and an executive summary sheet.
 */
export function exportComplaintsToExcel(
  complaints: (Complaint | EvaluatedComplaint)[],
  filenamePrefix = 'Camp_Resolver_Complaints'
): void {
  const currentTimestamp = Date.now();

  // Ensure all complaints have live evaluated fields
  const evaluatedList: EvaluatedComplaint[] = complaints.map((c) =>
    'urgencyScore' in c && typeof c.urgencyScore === 'number'
      ? (c as EvaluatedComplaint)
      : evaluateComplaint(c, currentTimestamp)
  );

  // 1. Data rows for "All Complaints" Sheet
  const rows = evaluatedList.map((c) => ({
    'Complaint ID': c.id,
    'Category': c.category,
    'Subject / Title': c.title || c.description,
    'Description': c.description,
    'Campus Location': c.location || 'Campus Facilities',
    'Student Name': c.studentName || 'Anonymous / Pre-seeded',
    'Scholar Number': c.scholarNumber || 'N/A',
    'Email Address': c.email || 'N/A',
    'GPS Geotag': c.gpsLocation || 'Not Attached',
    'Current Status': c.status,
    'Urgency Score': c.urgencyScore,
    'Priority Tier': `${c.urgencyTier} Priority`,
    'Category Weight': c.categoryWeight,
    'Pending Age (Hours)': c.ageInHours,
    'Submitted At': new Date(c.submittedAt).toLocaleString(),
    'Resolved At': c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : 'Pending',
    'Admin Remarks / Notes': c.adminRemarks || 'No remarks recorded',
  }));

  // 2. Data rows for "Executive Summary" Sheet
  const total = evaluatedList.length;
  const pending = evaluatedList.filter((c) => c.status === 'Raised' || c.status === 'In Progress').length;
  const resolved = evaluatedList.filter((c) => c.status === 'Resolved').length;
  const highPriority = evaluatedList.filter((c) => (c.status === 'Raised' || c.status === 'In Progress') && c.urgencyScore >= 4).length;

  const summaryData = [
    { Metric: 'Report Generated At', Value: new Date().toLocaleString() },
    { Metric: 'Total Recorded Complaints', Value: total },
    { Metric: 'Pending / In Progress Issues', Value: pending },
    { Metric: 'Resolved Complaints', Value: resolved },
    { Metric: 'High Priority (Urgency Score >= 4)', Value: highPriority },
    { Metric: '', Value: '' },
    { Metric: 'CATEGORY BREAKDOWN', Value: 'COUNT' },
    { Metric: 'Wi-Fi', Value: evaluatedList.filter((c) => c.category === 'Wi-Fi').length },
    { Metric: 'Hostel', Value: evaluatedList.filter((c) => c.category === 'Hostel').length },
    { Metric: 'Laboratory', Value: evaluatedList.filter((c) => c.category === 'Laboratory').length },
    { Metric: 'Classroom', Value: evaluatedList.filter((c) => c.category === 'Classroom').length },
    { Metric: 'Other', Value: evaluatedList.filter((c) => c.category === 'Other').length },
  ];

  // Create workbook and worksheets
  const wb = XLSX.utils.book_new();

  const wsComplaints = XLSX.utils.json_to_sheet(rows);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);

  // Set column widths for readability in Excel
  wsComplaints['!cols'] = [
    { wch: 14 }, // Complaint ID
    { wch: 14 }, // Category
    { wch: 32 }, // Title
    { wch: 45 }, // Description
    { wch: 28 }, // Location
    { wch: 20 }, // Student Name
    { wch: 18 }, // Scholar No
    { wch: 26 }, // Email
    { wch: 24 }, // GPS
    { wch: 14 }, // Status
    { wch: 14 }, // Urgency Score
    { wch: 18 }, // Priority Tier
    { wch: 16 }, // Category Weight
    { wch: 20 }, // Age Hours
    { wch: 22 }, // Submitted At
    { wch: 22 }, // Resolved At
    { wch: 40 }, // Admin Remarks
  ];

  wsSummary['!cols'] = [{ wch: 32 }, { wch: 24 }];

  // Append sheets
  XLSX.utils.book_append_sheet(wb, wsComplaints, 'All Complaints');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary Analytics');

  // Trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(wb, filename);
}
