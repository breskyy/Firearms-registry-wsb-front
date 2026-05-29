export function formatAttachmentContentTypeLabel(contentType: string) {
  if (contentType === "application/pdf") return "Dokument PDF";
  if (contentType.startsWith("image/")) return "Obraz";
  return "Załącznik";
}
