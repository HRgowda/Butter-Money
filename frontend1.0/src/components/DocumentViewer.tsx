import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Save, 
  Eye, 
  Pencil, 
  ArrowLeft, 
  Download, 
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  File,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set pdf.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface DocumentData {
  id: number;
  fileUrl: string;
  data: string;
  fileType: string;
  createdAt?: string;
  updatedAt?: string;
  fileName?: string;
  fileSize?: number;
}

interface ContentItem {
  type: string;
  text?: string;
  tableIndex?: number;
  headers?: string[];
  rows?: string[][];
  data?: string[];
}

interface SectionData {
  heading: string;
  content: ContentItem[];
}

const DocumentViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [parsedData, setParsedData] = useState<SectionData[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState('structured');
  const [pageNumber, setPageNumber] = useState(1);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [dataError, setDataError] = useState(false);
  
  const token = localStorage.getItem("token");
  const File_api = "http://localhost:3001/api/v1/pdf";
  const Base_url = "http://localhost:3001";

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`${File_api}/details/${id}`, {
          headers: {
            Authorization: token
          }
        });
        
        const enhancedData = {
          ...response.data,
          fileName: response.data.fileName || response.data.fileUrl.split('/').pop(),
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString(),
        };
        
        setDocumentData(enhancedData);

        // Safely parse the data
        if (response.data.data) {
          try {
            const parsed = JSON.parse(response.data.data);
            if (Array.isArray(parsed)) {
              // Ensure each section has a content array
              const validatedParsedData = parsed.map(section => ({
                ...section,
                heading: section.heading || 'Untitled Section',
                content: Array.isArray(section.content) ? section.content : []
              }));
              setParsedData(validatedParsedData);
            } else {
              console.error('Parsed data is not an array:', parsed);
              setParsedData([]);
              setDataError(true);
            }
          } catch (parseError) {
            console.error('Error parsing document data:', parseError);
            setParsedData([]);
            setDataError(true);
          }
        } else {
          setParsedData([]);
        }
      } catch (error) {
        console.error('Error fetching document data:', error);
        setDataError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  const handleContentChange = (sectionIndex: number, contentIndex: number, key: string, value: string) => {
    if (!editMode) return;

    const newData = [...parsedData];
    if (key === 'text') {
      (newData[sectionIndex].content[contentIndex] as any)[key] = value;
    } else if (key.includes('table')) {
      const [_, rowIndex, colIndex] = key.split('-').map(Number);
      if (newData[sectionIndex].content[contentIndex].type === 'structured_table') {
        newData[sectionIndex].content[contentIndex].rows![rowIndex][colIndex] = value;
      } else if (newData[sectionIndex].content[contentIndex].type === 'table') {
        newData[sectionIndex].content[contentIndex].data![colIndex] = value;
      }
    }
    setParsedData(newData);
  };

  const handleSectionHeadingChange = (sectionIndex: number, value: string) => {
    if (!editMode) return;

    const newData = [...parsedData];
    newData[sectionIndex].heading = value;
    setParsedData(newData);
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    try {
      await axios.post(`${File_api}/save/${id}`, {
        data: JSON.stringify(parsedData)
      }, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        }
      });
      setEditMode(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveError(true);
      
      setTimeout(() => {
        setSaveError(false);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!id || !documentData) return;
    
    try {
      const response = await axios.get(`${File_api}/download/${id}`, {
        headers: {
          Authorization: token,
        },
      });
  
      const fileUrl = response.data.url;
      if (fileUrl) {
        window.open(`${Base_url}${fileUrl}`, '_blank');
      } else {
        console.error('File URL not found in response');
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const getFileIcon = (fileType: string) => {
    switch(fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'docx':
        return <File className="h-6 w-6 text-blue-500" />;
      default:
        return <FileText className="h-6 w-6 text-blue-500" />;
    }
  };
  
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages || 1));
  };
  
  const renderContent = (content: ContentItem, sectionIndex: number, contentIndex: number) => {
    if (content.type === 'paragraph') {
      return editMode ? (
        <Textarea
          value={content.text || ''}
          onChange={(e) => handleContentChange(sectionIndex, contentIndex, 'text', e.target.value)}
          className="min-h-[100px] mb-4 text-base leading-relaxed"
        />
      ) : (
        <p className="mb-6 text-base leading-relaxed text-gray-700">{content.text}</p>
      );
    } else if (content.type === 'table' && content.data) {
      return (
        <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableBody>
              <TableRow className="bg-gray-50">
                {content.data.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="font-medium">
                    {editMode ? (
                      <Input
                        value={cell}
                        onChange={(e) => handleContentChange(sectionIndex, contentIndex, `table-0-${cellIndex}`, e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      cell
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      );
    } else if (content.type === 'structured_table' && content.headers && content.rows) {
      return (
        <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                {content.headers.map((header, headerIndex) => (
                  <TableHead key={headerIndex} className="text-gray-700 font-semibold">
                    {editMode ? (
                      <Input
                        value={header}
                        onChange={(e) => handleContentChange(sectionIndex, contentIndex, `table-header-${headerIndex}`, e.target.value)}
                        className="w-full font-medium"
                      />
                    ) : (
                      header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {content.rows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex} className="py-3">
                      {editMode ? (
                        <Input
                          value={cell}
                          onChange={(e) => handleContentChange(sectionIndex, contentIndex, `table-${rowIndex}-${cellIndex}`, e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        cell
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }
    return null;
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="w-24 h-24 flex items-center justify-center bg-white rounded-full shadow-lg mb-6 animate-pulse">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Loading Document</h3>
        <p className="text-gray-600 mb-6">Please wait while we prepare your document</p>
        <div className="w-64 bg-white p-1 rounded-full shadow-sm">
          <Progress value={65} className="h-2" />
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="container max-w-4xl mx-auto p-4 md:p-6 min-h-screen flex items-center justify-center">
        <Card className="w-full border-red-200 bg-gradient-to-r from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 flex items-center text-xl">
              <AlertCircle className="h-6 w-6 mr-2" />
              Document Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">The requested document could not be found or you don't have permission to view it.</p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container max-w-7xl mx-auto p-4 md:p-6">
        <Card className="mb-8 border-none shadow-xl overflow-hidden">
          <CardHeader className="text-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* File Info Section */}
              <div className="flex items-start space-x-5">
                <div className="bg-white/60 backdrop-blur-lg p-4 rounded-xl shadow-sm border border-gray-200">
                  {getFileIcon(documentData.fileType)}
                </div>
                <div>
                  <CardTitle className="text-2xl font-semibold mb-1 tracking-tight text-gray-900">
                    {documentData.fileName}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(documentData.createdAt || '')}
                    </span>
                    <span className="flex items-center">
                      <Badge variant="outline" className="text-xs font-normal">
                        {documentData.fileType.toUpperCase()}
                      </Badge>
                    </span>
                  </CardDescription>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 transition-transform transform hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 transition-transform transform hover:scale-105"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                {editMode ? (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={`bg-blue-600 hover:bg-blue-500 text-white rounded-md px-3 py-1.5 transition-transform ${saving ? 'opacity-70' : 'hover:scale-105'}`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Save Changes
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-md px-3 py-1.5 transition-transform hover:scale-105"
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          {(saveSuccess || saveError) && (
            <div 
              className={`px-6 py-3 flex items-center justify-center font-medium
                ${saveSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
            >
              {saveSuccess && (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Document successfully saved!
                </>
              )}
              {saveError && (
                <>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Error saving document. Please try again.
                </>
              )}
            </div>
          )}
        </Card>

        <Tabs 
          defaultValue="structured" 
          className="w-full" 
          onValueChange={setCurrentView}
        >
          <TabsList className="mb-6 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-lg">
            <TabsTrigger 
              value="structured"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              <FileText className="h-4 w-4 mr-2" /> Structured View
            </TabsTrigger>
            <TabsTrigger 
              value="original"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              <Eye className="h-4 w-4 mr-2" /> Original Document
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="structured" className="space-y-6">
            {parsedData.length === 0 ? (
              <Card className="bg-white shadow-lg">
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-semibold mb-3">
                    {dataError 
                      ? "Error Loading Structured Data" 
                      : "No Structured Data Available"}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {dataError 
                      ? "There was an error processing the document data. Try refreshing the page or contact support."
                      : `This ${documentData.fileType.toUpperCase()} document doesn't have any structured data yet.`}
                  </p>
                  {dataError && (
                    <Button 
                      onClick={() => window.location.reload()}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Loader2 className="h-4 w-4 mr-2" /> Refresh Page
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              parsedData.map((section, sectionIndex) => (
                <Card 
                  key={sectionIndex} 
                  className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className={`bg-gradient-to-r from-gray-50 to-white border-b ${editMode ? 'pb-4' : 'pb-2'}`}>
                    {editMode ? (
                      <Input
                        value={section.heading}
                        onChange={(e) => handleSectionHeadingChange(sectionIndex, e.target.value)}
                        className="font-bold text-lg"
                      />
                    ) : (
                      <CardTitle className="text-xl text-gray-800">{section.heading}</CardTitle>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6 px-6">
                    {(section.content || []).map((content, contentIndex) => (
                      <div key={contentIndex}>
                        {renderContent(content, sectionIndex, contentIndex)}
                        {contentIndex < (section.content || []).length - 1 && (
                          <Separator className="my-6 opacity-30" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="original">
            <Card className="bg-white shadow-lg">
              <CardContent className="pt-6">
                {documentData.fileType === 'pdf' && (
                  <div className="flex flex-col items-center rounded-lg p-6 bg-gradient-to-b from-gray-50 to-white">
                    <div className="mb-6 flex justify-between items-center w-full max-w-lg">
                      <div className="text-sm font-medium text-gray-600">
                        Page {pageNumber} of {numPages || 1}
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => changePage(-1)} 
                          disabled={pageNumber <= 1}
                          className="text-sm"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => changePage(1)} 
                          disabled={pageNumber >= (numPages || 1)}
                          className="text-sm"
                        >
                          Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border bg-white rounded-lg shadow-lg p-6">
                      <Document
                        file={`${Base_url}${documentData.fileUrl}`}
                        onLoadSuccess={onDocumentLoadSuccess}
                        className="pdf-document"
                      >
                        <Page 
                          pageNumber={pageNumber}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                          className="pdf-page"
                          width={Math.min(700, window.innerWidth - 48)}
                        />
                      </Document>
                    </div>
                  </div>
                )}
                {documentData.fileType.toLowerCase() === 'docx' && (
                  <div className="flex flex-col items-center text-center p-12 bg-gradient-to-b from-gray-50 to-white rounded-lg">
                    <File className="h-20 w-20 text-blue-500 mb-6" />
                    <h3 className="text-2xl font-semibold mb-3">DOCX Preview Unavailable</h3>
                    <p className="text-gray-600 mb-8 max-w-md">DOCX preview is not available in the browser. Please use the structured view to see and edit content.</p>
                    <div className="flex gap-4">
                      <Button 
                        onClick={handleDownload}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" /> Download Document
                      </Button>
                      <Button 
                        onClick={() => setCurrentView('structured')}
                        variant="outline"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4 mr-2" /> View Structured Data
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DocumentViewer;