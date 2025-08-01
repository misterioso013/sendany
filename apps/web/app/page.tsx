"use client";

import { useState, useCallback } from "react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Progress } from "@repo/ui/components/progress";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { Upload, Send, Download, Check, Copy, FileText, Image, Video, Archive, X, Plus, Link, MessageSquare, QrCode } from "lucide-react";
import { toast } from "sonner";

type ShareType = "files" | "link" | "text";

export default function Page() {
  const [shareType, setShareType] = useState<ShareType>("files");
  const [files, setFiles] = useState<File[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareLink, setShareLink] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} arquivo(s) adicionado(s) com sucesso!`);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} arquivo(s) selecionado(s)!`);
    }
  };

  const removeFile = (index: number) => {
    if (files[index]) {
      const fileName = files[index].name;
      setFiles(prev => prev.filter((_, i) => i !== index));
      toast.info(`${fileName} removido`);
    }
  };

  const handleUpload = async () => {
    if (shareType === "files" && files.length === 0) return;
    if (shareType === "link" && !linkInput.trim()) return;
    if (shareType === "text" && !textInput.trim()) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setShareLink("https://sendany.app/share/abc123xyz");
          const typeMap = {
            files: "Arquivos",
            link: "Link", 
            text: "Texto"
          };
          toast.success(`${typeMap[shareType]} enviado(s) com sucesso! Link de compartilhamento pronto.`);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copiado para a área de transferência!");
    } catch (err) {
      toast.error("Falha ao copiar o link");
    }
  };

  const generateQRCode = () => {
    toast.info("Gerando QR Code...");
    // QR Code functionality will be implemented later
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(extension || '')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <Archive className="h-4 w-4 text-orange-500" />;
    }
    return <FileText className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = () => {
    if (shareType === "files") return files.length > 0;
    if (shareType === "link") return linkInput.trim().length > 0;
    if (shareType === "text") return textInput.trim().length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative">
        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <Send className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
                Send<span className="text-blue-600">Any</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Compartilhe arquivos, links e textos com facilidade. Rápido, seguro e simples.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 space-y-6 pb-8">
        
        {/* Share Type Tabs */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setShareType("files")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  shareType === "files"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Upload className="h-4 w-4" />
                Arquivos
              </button>
              <button
                onClick={() => setShareType("link")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  shareType === "link"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Link className="h-4 w-4" />
                Links
              </button>
              <button
                onClick={() => setShareType("text")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  shareType === "text"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Texto
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Content based on selected type */}
        {shareType === "files" && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
                    dragActive ? 'bg-blue-100 scale-110' : 'bg-gray-100'
                  }`}>
                    <Upload className={`h-10 w-10 transition-colors duration-300 ${
                      dragActive ? 'text-blue-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">
                      {dragActive ? 'Solte seus arquivos aqui' : 'Envie seus arquivos'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Arraste e solte arquivos aqui, ou clique para navegar
                    </p>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Escolher Arquivos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {shareType === "link" && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Compartilhar Link</CardTitle>
              <CardDescription className="text-gray-600">
                Cole o link que você deseja compartilhar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="url"
                placeholder="https://exemplo.com"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {shareType === "text" && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Compartilhar Texto</CardTitle>
              <CardDescription className="text-gray-600">
                Digite ou cole o texto que você deseja compartilhar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Digite seu texto aqui..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
              />
              <div className="text-sm text-gray-500">
                {textInput.length} caracteres
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Files (only for files type) */}
        {shareType === "files" && files.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900">Arquivos Selecionados</CardTitle>
                <Badge variant="secondary" className="gap-1">
                  {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'}
                  <span className="text-xs opacity-70">
                    • {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="group flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="opacity-60 group-hover:opacity-100 text-gray-500 hover:text-red-600 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFiles([]);
                    toast.info("Todos os arquivos foram removidos");
                  }}
                  disabled={uploading}
                  className="flex-1"
                >
                  Limpar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Button */}
        {canUpload() && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Card className="bg-white border border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Progresso do envio</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3" />
                <p className="text-sm text-gray-600">
                  Aguarde enquanto enviamos seu conteúdo de forma segura.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success - Share Link */}
        {shareLink && (
          <Card className="bg-white border border-green-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Check className="h-5 w-5" />
                Envio Concluído!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600 mb-2">Link de compartilhamento:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono text-gray-900">
                    {shareLink}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={generateQRCode}
                  className="flex-1 gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShareLink("");
                    setFiles([]);
                    setLinkInput("");
                    setTextInput("");
                    setUploadProgress(0);
                    toast.info("Pronto para novo envio");
                  }}
                  className="flex-1 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Novo Envio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}