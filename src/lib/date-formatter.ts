/**
 * Utility functions to format dates and times into Thai format (พ.ศ. and Asia/Bangkok time)
 */

export function formatThaiDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return String(dateString);
  }
}

export function formatThaiDateTime(dateString: string | Date | undefined | null): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " น.";
  } catch (e) {
    return String(dateString);
  }
}

export function getBangkokDateString(dateInput?: Date | string | null): string {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return "";
    const bangkokTime = date.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
    const d = new Date(bangkokTime);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return "";
  }
}

