import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Download, ExternalLink, Loader2, FileWarning } from "lucide-react";

interface AttachmentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  contentType: string;
  fetchBlob: () => Promise<Blob>;
}

export function AttachmentPreviewDialog({
  open,
  onOpenChange,
  fileName,
  contentType,
  fetchBlob,
}: AttachmentPreviewDialogProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    let revokedUrl: string | null = null;
    fetchBlob()
      .then((blob) => {
        const typed = blob.type === contentType ? blob : new Blob([blob], { type: contentType });
        const url = URL.createObjectURL(typed);
        revokedUrl = url;
        setBlobUrl(url);
      })
      .catch((err: any) => {
        setError(err?.message ?? "Nie udało się pobrać pliku");
      })
      .finally(() => setLoading(false));

    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
      setBlobUrl(null);
    };
  }, [open, contentType, fetchBlob]);

  const isImage = contentType.startsWith("image/");
  const isPdf = contentType === "application/pdf";

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!blobUrl) return;
    window.open(blobUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">{fileName}</DialogTitle>
          <DialogDescription>
            {contentType} {isPdf && "— dokument PDF"}
            {isImage && "— obraz"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/30 rounded-xl flex items-center justify-center min-h-[50vh]">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Wczytywanie podglądu...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-2 text-red-600 p-6 text-center">
              <FileWarning className="h-8 w-8" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && blobUrl && isImage && (
            <img src={blobUrl} alt={fileName} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
          )}

          {!loading && !error && blobUrl && isPdf && (
            <iframe
              src={blobUrl}
              title={fileName}
              className="w-full h-[70vh] rounded-lg bg-white"
            />
          )}

          {!loading && !error && blobUrl && !isImage && !isPdf && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground p-6">
              <FileWarning className="h-10 w-10" />
              <p className="text-sm text-center">Format <code>{contentType}</code> nie obsługuje podglądu w aplikacji. Pobierz plik aby go otworzyć.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={handleOpenNewTab} disabled={!blobUrl} className="rounded-xl">
            <ExternalLink className="h-4 w-4 mr-2" />
            Otwórz w nowej karcie
          </Button>
          <Button onClick={handleDownload} disabled={!blobUrl} className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Pobierz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
