import PDFViewer from "@/components/pdf-viewer"

const PDFThumbnail = (currentPdfResource: any) => {

    return (
        <>
            <PDFViewer
                src={currentPdfResource.url}
                fileName={currentPdfResource.name}
            />
        </>
    )
}
export default PDFThumbnail;