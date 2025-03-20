import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, Upload, LogOut, FileText, AlertCircle, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const BASE_URL = "http://localhost:3001/api/v1/pdf";

interface PdfData {
  id: number;
  fileUrl: string;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState<PdfData[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handlePdfUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();

      const formData = new FormData();
      formData.append('file', selectedFile);

      await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSelectedFile(null);
      fetchPdfs();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const fetchPdfs = async () => {
    try {
      setFetchingFiles(true);
      const token = getToken();

      const response = await axios.get(`${BASE_URL}/`, {
        headers: { Authorization: `${token}` },
      });

      setPdfs(response.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      alert('Failed to fetch files');
    } finally {
      setFetchingFiles(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  const formatFileName = (fileUrl: string) => {
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return 'Unknown File';
    const cleanName = fileName.replace(/^\d+-/, '').replace(/[-_]/g, ' ');
    return cleanName;
  };

  const handleViewFile = (id: number) => {
    navigate(`/documents/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* Navbar */}
      <nav className="backdrop-blur-lg shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              Butter Money
            </h1>
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <Button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              variant="ghost"
              className="flex items-center text-gray-700 hover:text-gray-900 transition-transform transform hover:scale-105"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <Card className="mb-8 shadow-lg border border-gray-200 rounded-xl overflow-hidden transition-transform transform hover:scale-[1.02] ">
      <CardContent className="p-6 ">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 transition-colors duration-200',
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
            'hover:border-blue-400 hover:bg-blue-50/50'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Drag and Drop Section */}
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-blue-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-base font-medium text-gray-800">
                  Drop your file here, or{' '}
                  <span className="text-blue-600 hover:text-blue-500 underline">
                    browse
                  </span>
                </span>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              PDF or DOCX 
            </p>
          </div>

          {/* File Preview Section */}
          {selectedFile && (
            <div className="mt-6  border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </span>
                </div>
                <Button
                  onClick={handlePdfUpload}
                  disabled={loading}
                  className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg transition-all"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

        {/* Files Section */}
        <div className=" rounded-xl shadow-lg ring-1 ring-black/5 overflow-hidden bg-[#F0F4F8]">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white bg-[#F0F4F8]">
            <h2 className="text-xl font-semibold text-gray-900">Your Files</h2>
          </div>
          
          <div className="p-6">
            {fetchingFiles ? (
              <div className="flex justify-center py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                  <p className="mt-4 text-sm text-gray-500">Loading your files...</p>
                </div>
              </div>
            ) : pdfs.length === 0 ? (
              <div className="text-center py-12">
                <div className=" rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No files yet</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                  Upload your first file to get started with document management
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pdfs.map((pdf, index) => (
                  <Card
                    key={pdf.id}
                    className="group hover: transition-all duration-200 hover:shadow-md border border-gray-100"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 bg-blue-50 rounded-lg p-2 group-hover:bg-blue-100 transition-colors">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {formatFileName(pdf.fileUrl)}
                            </p>
                            <div className="flex items-center mt-1 space-x-4">
                              <div className="flex items-center text-xs text-gray-500">
                                <span>Document #{index + 1}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleViewFile(pdf.id)}
                          variant="outline"
                          className="flex items-center  hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-200 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;