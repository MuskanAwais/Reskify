import { useState } from "react";
import type { SwmsFormData } from "@shared/schema";
import { defaultSwmsData } from "@shared/schema";
import riskifyLogo from '@assets/slogan-6_1750823980552.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf as reactPdf, Image } from '@react-pdf/renderer';
import { RiskBadgeNew } from "../components/RiskBadgeNew";

type DocumentPage = 'project-info' | 'emergency-info' | 'high-risk-activities' | 'risk-matrix' | 'work-activities' | 'ppe' | 'plant-equipment' | 'msds' | 'sign-in';

export default function SwmsComplete() {
  const [formData, setFormData] = useState<SwmsFormData>(defaultSwmsData);
  const [currentPage, setCurrentPage] = useState<DocumentPage>('project-info');
  const [currentWorkActivitiesPageIndex, setCurrentWorkActivitiesPageIndex] = useState(0);
  const [currentSignInPageIndex, setCurrentSignInPageIndex] = useState(0);

  const handleInputChange = (field: keyof SwmsFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Risk badge styles and levels
  const riskLevels = {
    extreme: { color: '#dc2626', text: '#ffffff' },
    high: { color: '#f97316', text: '#ffffff' },
    medium: { color: '#eab308', text: '#ffffff' },
    low: { color: '#22c55e', text: '#ffffff' }
  };

  const getRiskBadgeHTML = (level: string, score: number) => {
    const risk = riskLevels[level as keyof typeof riskLevels] || riskLevels.medium;
    
    return `<div style="display: table-cell; vertical-align: middle; text-align: center; background-color: ${risk.color}; color: #ffffff; border-radius: 4px; font-size: 10px; font-weight: 600; width: 70px; height: 24px; box-sizing: border-box; white-space: nowrap; font-family: Inter, Arial, sans-serif;">${level.charAt(0).toUpperCase() + level.slice(1)} (${score})</div>`;
  };

  const getRiskBadgeTextOnly = (level: string) => {
    const risk = riskLevels[level as keyof typeof riskLevels] || riskLevels.medium;
    
    return `<div style="display: inline-flex; align-items: flex-start; justify-content: center; background-color: ${risk.color}; color: #ffffff; border-radius: 4px; font-size: 10px; font-weight: 600; width: 70px; height: 24px; box-sizing: border-box; white-space: nowrap; font-family: Inter, Arial, sans-serif; line-height: 1; padding-top: 6px;">${level.charAt(0).toUpperCase() + level.slice(1)}</div>`;
  };

  const handlePrintPDF = async () => {
    try {
      console.log('Starting browser print PDF generation...');
      
      // Store current page to restore later
      const originalPage = currentPage;
      
      // Create PDF with A4 landscape dimensions and maximum quality
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: false, // Disable compression for maximum quality
        precision: 16 // High precision for better quality
      });
      
      const pageNames = ['project-info', 'emergency-info', 'high-risk-activities', 'risk-matrix', 'work-activities', 'ppe', 'plant-equipment', 'sign-in', 'msds'] as const;
      
      for (let i = 0; i < pageNames.length; i++) {
        const pageName = pageNames[i];
        console.log(`Capturing page ${i + 1}: ${pageName}`);
        
        // Switch to the page
        setCurrentPage(pageName);
        
        // Wait for React to render
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Ensure all fonts are loaded before capture
        try {
          await document.fonts.ready;
        } catch (e) {
          // Fallback if fonts.ready fails
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Wait for the page content to render
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Find the actual document preview container - it's in the right panel
        let previewElement = document.querySelector('.w-2\\/3 .p-6 > div') as HTMLElement;
        
        if (!previewElement) {
          // Try alternative selectors for the document container
          previewElement = document.querySelector('.w-2\\/3 > div > div') as HTMLElement ||
                          document.querySelector('.overflow-auto > div > div') as HTMLElement ||
                          document.querySelector('[style*="A4"]') as HTMLElement;
        }
        
        // Debug: log what we found
        console.log(`Capturing page ${i + 1}: ${pageName}`);
        console.log('Preview element found:', previewElement?.tagName || 'none');
        console.log('Element classes:', previewElement?.className || 'none');
        console.log('Element dimensions:', previewElement?.offsetWidth || 0, 'x', previewElement?.offsetHeight || 0);
        console.log('Element has content:', previewElement?.innerHTML?.length > 100 || false);
        
        if (!previewElement || previewElement.offsetWidth === 0 || previewElement.offsetHeight === 0) {
          console.error(`Could not find valid preview element for page: ${pageName}`);
          continue;
        }
        
        // Ensure element is fully visible and rendered
        previewElement.style.visibility = 'visible';
        previewElement.style.display = 'block';
        
        // Force layout recalculation
        previewElement.offsetHeight;
        
        // Add more detailed debugging
        console.log('Element inner HTML length:', previewElement.innerHTML.length);
        console.log('Element has background:', window.getComputedStyle(previewElement).backgroundColor);
        console.log('Element position:', window.getComputedStyle(previewElement).position);
        
        // Use a simpler, more reliable canvas capture approach
        const canvas = await html2canvas(previewElement, {
          scale: 2.5,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1123, // Fixed A4 landscape width
          height: 794,  // Fixed A4 landscape height
          windowWidth: 1123,
          windowHeight: 794,
          onclone: (clonedDoc) => {
            // Add essential styles to ensure text and colors render
            const style = clonedDoc.createElement('style');
            style.textContent = `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
                box-sizing: border-box !important;
                color: inherit !important;
              }
              body { background: #ffffff !important; color: #000000 !important; }
              .bg-white { background-color: #ffffff !important; }
              .text-black { color: #000000 !important; }
              .text-gray-900 { color: #111827 !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .text-gray-500 { color: #6b7280 !important; }
              .border { border: 1px solid #e5e7eb !important; }
              .font-bold { font-weight: 700 !important; }
              .font-semibold { font-weight: 600 !important; }
              .font-medium { font-weight: 500 !important; }
              table { border-collapse: collapse !important; width: 100% !important; }
              td, th { 
                border: 1px solid #e5e7eb !important; 
                padding: 12px !important; 
                color: #111827 !important;
                background-color: #ffffff !important;
                vertical-align: top !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
              }
              .bg-red-500 { background-color: #ef4444 !important; }
              .bg-orange-500 { background-color: #f97316 !important; }
              .bg-yellow-500 { background-color: #eab308 !important; }
              .bg-green-500 { background-color: #22c55e !important; }
              .text-white { color: #ffffff !important; }
              .rounded { border-radius: 0.25rem !important; }
              .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
              .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
              .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
              .inline-block { display: inline-block !important; }
              .text-center { text-align: center !important; }
            `;
            clonedDoc.head.appendChild(style);
          }
        });
        
        // Debug canvas capture results
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        console.log('Canvas has data:', canvas.width > 0 && canvas.height > 0);
        
        // Check if canvas is actually blank by sampling some pixels
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('Could not get canvas 2D context');
          continue;
        }
        const imageData = ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height));
        const pixels = imageData.data;
        let hasNonWhitePixels = false;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] !== 255 || pixels[i + 1] !== 255 || pixels[i + 2] !== 255) {
            hasNonWhitePixels = true;
            break;
          }
        }
        console.log('Canvas has non-white content:', hasNonWhitePixels);
        
        // Convert canvas to PNG for maximum quality (no compression artifacts)
        const imgData = canvas.toDataURL('image/png'); // PNG for perfect quality
        console.log('Image data URL length:', imgData.length);
        
        // Add page to PDF (if not first page)
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate dimensions to fit A4 landscape (297x210mm)
        const pdfWidth = 297;
        const pdfHeight = 210;
        const imgAspectRatio = canvas.width / canvas.height;
        const pdfAspectRatio = pdfWidth / pdfHeight;
        
        let imgWidth, imgHeight;
        if (imgAspectRatio > pdfAspectRatio) {
          // Image is wider, fit to width
          imgWidth = pdfWidth;
          imgHeight = pdfWidth / imgAspectRatio;
        } else {
          // Image is taller, fit to height
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * imgAspectRatio;
        }
        
        // Center the image on the page
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        
        console.log(`Added page ${i + 1} to PDF`);
      }
      
      // Restore original page
      setCurrentPage(originalPage);
      
      // Generate filename
      const projectName = formData.projectName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `SWMS_${projectName}.pdf`;
      
      // Get selected MSDS documents
      const selectedMSDSDocuments = formData.msdsDocuments.filter(doc => doc.selected);

      if (selectedMSDSDocuments.length > 0) {
        try {
          console.log(`Appending ${selectedMSDSDocuments.length} MSDS PDF documents...`);
          
          // Get the generated PDF as bytes
          const pdfBytes = pdf.output('arraybuffer');
          
          // Create a PDFDocument from the generated PDF
          const mergedPdf = await PDFDocument.load(pdfBytes);

          // Append each selected MSDS document
          for (const msdsDoc of selectedMSDSDocuments) {
            try {
              console.log(`Appending MSDS document: ${msdsDoc.customTitle || msdsDoc.fileName}`);
              console.log(`File data available: ${!!msdsDoc.fileData}, length: ${msdsDoc.fileData?.length}`);
              
              if (!msdsDoc.fileData) {
                console.error(`No file data for MSDS document: ${msdsDoc.customTitle || msdsDoc.fileName}`);
                console.warn('Skipping document with no file data');
                continue;
              }
              
              // Validate that file data looks like base64
              if (!msdsDoc.fileData.includes('data:') && !msdsDoc.fileData.match(/^[A-Za-z0-9+/=]+$/)) {
                console.error(`Invalid file data format for: ${msdsDoc.customTitle || msdsDoc.fileName}`);
                console.warn('File data does not appear to be valid base64');
                continue;
              }
              
              // Load the MSDS PDF document from stored file data
              // Convert base64 to ArrayBuffer
              const base64Data = msdsDoc.fileData.includes(',') ? msdsDoc.fileData.split(',')[1] : msdsDoc.fileData;
              console.log(`Processing base64 data, length: ${base64Data.length}`);
              
              const binaryString = atob(base64Data);
              const msdsPdfBytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                msdsPdfBytes[i] = binaryString.charCodeAt(i);
              }
              
              console.log(`Converted to bytes array, length: ${msdsPdfBytes.length}`);
              
              let msdsPdf;
              try {
                msdsPdf = await PDFDocument.load(msdsPdfBytes);
                console.log(`PDF loaded successfully, page count: ${msdsPdf.getPageCount()}`);
              } catch (loadError) {
                const error = loadError as any;
                console.error(`Failed to load PDF document:`, error);
                console.error(`Error type: ${error.constructor?.name}`);
                console.error(`Error message: ${error.message}`);
                
                // Check if this might be an encrypted/protected PDF
                if (error.message?.includes('encrypted') || error.message?.includes('password')) {
                  console.error('This appears to be an encrypted PDF file. PDF-lib cannot process encrypted PDFs.');
                  throw new Error(`Cannot append encrypted PDF: ${msdsDoc.customTitle || msdsDoc.fileName}`);
                }
                
                throw error;
              }
              
              // Copy all pages from the MSDS PDF to the merged PDF
              const pageIndices = msdsPdf.getPageIndices();
              const copiedPages = await mergedPdf.copyPages(msdsPdf, pageIndices);
              
              // Add the copied pages to the merged PDF
              copiedPages.forEach(page => mergedPdf.addPage(page));
              
              console.log(`Successfully appended ${pageIndices.length} pages from ${msdsDoc.customTitle || msdsDoc.fileName}`);
            } catch (error) {
              console.error(`Error appending MSDS document ${msdsDoc.customTitle || msdsDoc.fileName}:`, error);
              // Log specific error details for debugging
              if (error instanceof Error) {
                console.error(`Error message: ${error.message}`);
                console.error(`Error stack: ${error.stack}`);
              }
              // Continue with other documents even if one fails
              continue;
            }
          }

          // Save the merged PDF
          const mergedPdfBytes = await mergedPdf.save();
          const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
          
          // Create download link and trigger download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          console.log('PDF with attached MSDS documents saved successfully as:', filename);
        } catch (error) {
          console.error('Error merging MSDS documents:', error);
          
          // Provide specific error messaging based on the error type
          let errorMessage = 'Failed to attach MSDS documents to PDF.';
          if (error instanceof Error) {
            if (error.message.includes('encrypted')) {
              errorMessage += ' One or more MSDS documents appear to be encrypted or password-protected. PDF saved without attachments.';
            } else if (error.message.includes('Invalid PDF')) {
              errorMessage += ' One or more MSDS documents have invalid PDF format. PDF saved without attachments.';
            } else {
              errorMessage += ' PDF saved without MSDS attachments.';
            }
          }
          
          // Fallback to original PDF if merging fails
          pdf.save(filename);
          console.log('Fallback: PDF saved without MSDS attachments as:', filename);
          
          // Show user notification about the issue
          alert(errorMessage);
        }
      } else {
        // No MSDS documents selected, save the original PDF
        pdf.save(filename);
        console.log('PDF generation completed successfully');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handlePrintAllPages = async () => {
    try {
      // Store current page to restore later
      const originalPage = currentPage;
      
      // Calculate number of Work Activities pages (2 activities per page)
      const workActivitiesPageCount = Math.max(1, Math.ceil(formData.workActivities.length / 2));
      
      // Create page list with multiple work activities pages
      const pageNames: (typeof originalPage)[] = [
        'project-info', 
        'emergency-info', 
        'high-risk-activities', 
        'risk-matrix'
      ];
      
      // Add all work activities pages
      for (let i = 0; i < workActivitiesPageCount; i++) {
        pageNames.push('work-activities');
      }
      
      pageNames.push('ppe', 'plant-equipment', 'sign-in', 'msds');
      
      const images: string[] = [];

      console.log(`Starting PNG capture for PDF generation... Total pages: ${pageNames.length}`);

      // Capture each page as PNG from the perfectly formatted preview
      for (let i = 0; i < pageNames.length; i++) {
        const pageName = pageNames[i];
        console.log(`Capturing page ${i + 1}: ${pageName}`);
        
        // Switch to the page
        setCurrentPage(pageName);
        
        // Wait longer for React to render and page to be visible
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Find the document preview container using multiple possible selectors
        let previewContainer: HTMLElement | null = null;
        const selectors = [
          '.w-2\\/3 .overflow-auto > div',
          '.w-2\\/3 .p-6 > div',
          '.w-2\\/3 > div > div',
          '[class*="w-2/3"] .overflow-auto > div',
          '[class*="w-2/3"] > div > div',
          '.overflow-auto > div',
          '.p-6 > div'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector) as HTMLElement;
          if (element && element.offsetHeight > 100) {
            previewContainer = element;
            console.log(`Found preview container with selector: ${selector}`);
            break;
          }
        }
        
        if (!previewContainer) {
          console.error('Could not find preview container with any selector');
          // Try to find any visible div in the right panel
          const rightPanel = document.querySelector('.w-2\\/3') || document.querySelector('[class*="w-2/3"]');
          if (rightPanel) {
            const allDivs = rightPanel.querySelectorAll('div');
            for (let i = 0; i < allDivs.length; i++) {
              const htmlDiv = allDivs[i] as HTMLElement;
              if (htmlDiv.offsetHeight > 200 && htmlDiv.offsetWidth > 400 && !previewContainer) {
                previewContainer = htmlDiv;
                console.log('Found fallback preview container');
                break;
              }
            }
          }
        }
        
        if (!previewContainer) {
          console.error('Could not find any suitable preview container');
          continue;
        }

        // Force the container to have a white background before capture
        const originalBackground = previewContainer.style.backgroundColor;
        previewContainer.style.backgroundColor = '#ffffff';
        
        // Capture the preview container as high-quality image
        const canvas = await html2canvas(previewContainer, {
          scale: 2.5, // Higher scale for maximum quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: previewContainer.scrollWidth,
          height: previewContainer.scrollHeight,
          logging: true, // Enable logging to see what's happening
          imageTimeout: 15000,
          removeContainer: false, // Keep container during capture
          foreignObjectRendering: false, // Disable for better compatibility
          onclone: (clonedDoc, element) => {
            // Add comprehensive styling for PDF capture
            const style = clonedDoc.createElement('style');
            style.textContent = `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
                box-sizing: border-box !important;
              }
              body { background: #ffffff !important; color: #000000 !important; }
              .bg-white { background-color: #ffffff !important; }
              .text-white { color: #ffffff !important; }
              .bg-red-500 { background-color: #ef4444 !important; }
              .bg-orange-500 { background-color: #f97316 !important; }
              .bg-yellow-500 { background-color: #eab308 !important; }
              .bg-green-500 { background-color: #22c55e !important; }
              .rounded { border-radius: 0.25rem !important; }
              .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
              .py-1 { padding-top: 0.25rem !important; padding-bottom: 0.25rem !important; }
              .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
              .inline-block { display: inline-block !important; }
              .text-center { text-align: center !important; }
              .font-bold { font-weight: 700 !important; }
              .font-semibold { font-weight: 600 !important; }
              .font-medium { font-weight: 500 !important; }
              table { border-collapse: collapse !important; width: 100% !important; }
              td, th { 
                border: 1px solid #e5e7eb !important; 
                padding: 12px !important; 
                color: #111827 !important;
                background-color: #ffffff !important;
                vertical-align: top !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
              }
              /* Risk badge specific styling - ensure proper centering */
              .bg-red-500.text-white { 
                background-color: #ef4444 !important; 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                vertical-align: middle !important;
              }
              .bg-orange-500.text-white { 
                background-color: #f97316 !important; 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                vertical-align: middle !important;
              }
              .bg-yellow-500.text-white { 
                background-color: #eab308 !important; 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                vertical-align: middle !important;
              }
              .bg-green-500.text-white { 
                background-color: #22c55e !important; 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                vertical-align: middle !important;
              }
              /* Additional risk badge selectors */
              span[style*="background-color: rgb(239, 68, 68)"] { 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
              }
              span[style*="background-color: rgb(249, 115, 22)"] { 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
              }
              span[style*="background-color: rgb(234, 179, 8)"] { 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
              }
              span[style*="background-color: rgb(34, 197, 94)"] { 
                color: #ffffff !important; 
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
              }
              
              /* Enhanced CSS for risk badge color capture */
              div[style*="background-color: #dc2626"] {
                background-color: #dc2626 !important;
                color: #ffffff !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                height: 24px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              div[style*="background-color: #ea580c"] {
                background-color: #ea580c !important;
                color: #ffffff !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                height: 24px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              div[style*="background-color: #eab308"] {
                background-color: #eab308 !important;
                color: #ffffff !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                height: 24px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              div[style*="background-color: #22c55e"] {
                background-color: #22c55e !important;
                color: #000000 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
                line-height: 1 !important;
                height: 24px !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            `;
            clonedDoc.head.appendChild(style);
            
            // Ensure all elements have proper backgrounds and badge styling
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el: any) => {
              if (el.style) {
                // Force visible backgrounds on key elements
                if (el.tagName === 'DIV' && el.className.includes('bg-white')) {
                  el.style.backgroundColor = '#ffffff';
                }
                if (el.tagName === 'TD' || el.tagName === 'TH') {
                  el.style.backgroundColor = '#ffffff';
                }
                // Fix risk badges specifically
                if (el.className && el.className.includes('text-white')) {
                  el.style.color = '#ffffff';
                  if (el.className.includes('bg-red-500')) {
                    el.style.backgroundColor = '#ef4444';
                  } else if (el.className.includes('bg-orange-500')) {
                    el.style.backgroundColor = '#f97316';
                  } else if (el.className.includes('bg-yellow-500')) {
                    el.style.backgroundColor = '#eab308';
                  } else if (el.className.includes('bg-green-500')) {
                    el.style.backgroundColor = '#22c55e';
                  }
                }
                
                // Enhanced risk badge detection and fixing - target elements with inline styles
                if (el.style && el.style.backgroundColor) {
                  // Check if this is a risk badge by checking for specific background colors
                  const bgColor = el.style.backgroundColor.toLowerCase();
                  if (bgColor.includes('dc2626') || bgColor.includes('239, 68, 68')) {
                    // Extreme risk - red
                    el.style.backgroundColor = '#dc2626 !important';
                    el.style.color = '#ffffff !important';
                    el.style.webkitPrintColorAdjust = 'exact';
                    el.style.printColorAdjust = 'exact';
                  } else if (bgColor.includes('ea580c') || bgColor.includes('249, 115, 22')) {
                    // High risk - orange
                    el.style.backgroundColor = '#ea580c !important';
                    el.style.color = '#ffffff !important';
                    el.style.webkitPrintColorAdjust = 'exact';
                    el.style.printColorAdjust = 'exact';
                  } else if (bgColor.includes('eab308') || bgColor.includes('234, 179, 8')) {
                    // Medium risk - yellow
                    el.style.backgroundColor = '#eab308 !important';
                    el.style.color = '#ffffff !important';
                    el.style.webkitPrintColorAdjust = 'exact';
                    el.style.printColorAdjust = 'exact';
                  } else if (bgColor.includes('22c55e') || bgColor.includes('34, 197, 94')) {
                    // Low risk - green
                    el.style.backgroundColor = '#22c55e !important';
                    el.style.color = '#000000 !important';
                    el.style.webkitPrintColorAdjust = 'exact';
                    el.style.printColorAdjust = 'exact';
                  }
                }
              }
            });
          },
          ignoreElements: (element) => {
            return element.classList?.contains('no-print') || false;
          }
        });
        
        // Restore original background
        previewContainer.style.backgroundColor = originalBackground;

        // Convert to PNG for maximum quality
        const imageData = canvas.toDataURL('image/png', 1.0);
        images.push(imageData);
        
        console.log(`Successfully captured page ${i + 1} as PNG`);
        
        // Add small delay between captures to prevent memory issues
        if (i < pageNames.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Restore original page
      setCurrentPage(originalPage);

      if (images.length === 0) {
        console.error('No pages were captured');
        alert('No pages were captured. Please try again.');
        return;
      }

      console.log(`Creating PDF with ${images.length} pages...`);

      try {
        // Create PDF from captured images with maximum quality
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
          compress: false // Maximum quality, no compression
        });

        // Add each captured page to PDF with maximum quality
        for (let i = 0; i < images.length; i++) {
          if (i > 0) {
            pdf.addPage();
          }
          
          try {
            // Add PNG image with maximum quality settings
            pdf.addImage(images[i], 'PNG', 0, 0, 297, 210, '', 'SLOW');
            console.log(`Added page ${i + 1} to PDF`);
          } catch (pageError) {
            console.error(`Error adding page ${i + 1} to PDF:`, pageError);
            // Continue with other pages
          }
        }

        // Generate filename
        const filename = `SWMS_${formData.projectName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        
        console.log('About to save PDF with filename:', filename);
        
        // Get selected MSDS documents
        const selectedMSDSDocuments = formData.msdsDocuments.filter(doc => doc.selected);

        if (selectedMSDSDocuments.length > 0) {
          try {
            console.log(`Appending ${selectedMSDSDocuments.length} MSDS PDF documents...`);
            console.log('Selected MSDS documents:', selectedMSDSDocuments.map(doc => ({ 
              fileName: doc.fileName, 
              customTitle: doc.customTitle,
              hasFileData: !!doc.fileData,
              fileDataLength: doc.fileData?.length 
            })));
            
            // Get the generated PDF as bytes
            const pdfBytes = pdf.output('arraybuffer');
            
            // Create a PDFDocument from the generated PDF
            const mergedPdf = await PDFDocument.load(pdfBytes);

            // Append each selected MSDS document
            for (const msdsDoc of selectedMSDSDocuments) {
              try {
                console.log(`Appending MSDS document: ${msdsDoc.customTitle || msdsDoc.fileName}`);
                
                // Load the MSDS PDF document from stored file data
                // Convert base64 to ArrayBuffer
                const binaryString = atob(msdsDoc.fileData.split(',')[1] || msdsDoc.fileData);
                const msdsPdfBytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  msdsPdfBytes[i] = binaryString.charCodeAt(i);
                }
                const msdsPdf = await PDFDocument.load(msdsPdfBytes);
                
                // Copy all pages from the MSDS PDF to the merged PDF
                const pageIndices = msdsPdf.getPageIndices();
                const copiedPages = await mergedPdf.copyPages(msdsPdf, pageIndices);
                
                // Add the copied pages to the merged PDF
                copiedPages.forEach(page => mergedPdf.addPage(page));
                
                console.log(`Successfully appended ${pageIndices.length} pages from ${msdsDoc.customTitle || msdsDoc.fileName}`);
              } catch (error) {
                console.error(`Error appending MSDS document ${msdsDoc.customTitle || msdsDoc.fileName}:`, error);
              }
            }

            // Save the merged PDF
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            
            // Create download link and trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('PDF with attached MSDS documents saved successfully as:', filename);
          } catch (error) {
            console.error('Error merging MSDS documents:', error);
            // Fallback to original PDF if merging fails
            pdf.save(filename);
            console.log('Fallback: PDF saved without MSDS attachments as:', filename);
          }
        } else {
          // No MSDS documents selected, save the original PDF
          pdf.save(filename);
          console.log(`PDF saved successfully as: ${filename}`);
        }
        
      } catch (pdfError) {
        console.error('Error creating PDF:', pdfError);
        alert('PDF creation failed. Please try again.');
        return;
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
      console.error('Error message:', error instanceof Error ? error.message : 'No message available');
      alert('Error generating PDF. Please try again.');
    }
  };

  // Puppeteer PDF Export using backend headless Chrome
  const exportPuppeteerPdf = async () => {
    try {
      console.log('Starting Puppeteer PDF generation...');
      
      // Show notice that we're falling back to the reliable PNG-to-PDF method
      alert('Pixel PDF is not available in this environment. Using the high-quality Download method instead.');
      
      // Use the reliable PNG-to-PDF export as fallback
      await generatePdf();
      
    } catch (error) {
      console.error('Puppeteer PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  // Generate complete HTML content for all pages with inline styling
  const generateAllPagesHTML = async () => {
    const pages = ['project-info', 'emergency-info', 'high-risk-activities', 'risk-matrix', 'work-activities', 'ppe', 'plant-equipment', 'sign-in'];
    const pageElements: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const pageType = pages[i];
      let pageHtml = '';
      
      // Handle work activities pagination
      if (pageType === 'work-activities') {
        const totalActivities = formData.workActivities.length;
        const activitiesPerPage = 2;
        const totalPages = Math.ceil(totalActivities / activitiesPerPage);
        
        for (let pageIndex = 0; pageIndex < Math.max(1, totalPages); pageIndex++) {
          pageHtml += generatePageHTML(pageType, pageIndex);
          if (pageIndex < totalPages - 1) {
            pageHtml += '<div class="page-break"></div>';
          }
        }
      } else {
        pageHtml = generatePageHTML(pageType, 0);
      }
      
      pageElements.push(pageHtml);
    }

    return pageElements.join('<div class="page-break"></div>');
  };

  // Generate HTML for a specific page with inline styles
  const generatePageHTML = (pageType: string, pageIndex: number = 0) => {
    const getRiskBadge = (level: string, score: number | string) => {
      const colors = {
        'extreme': '#dc2626',
        'high': '#ea580c', 
        'medium': '#eab308',
        'low': '#22c55e'
      };
      const color = colors[level as keyof typeof colors] || colors.medium;
      
      const badgeText = score === '' || score === 0 ? 
        level.charAt(0).toUpperCase() + level.slice(1) : 
        `${level.charAt(0).toUpperCase() + level.slice(1)} (${score})`;
      
      return `<div style="display: inline-block; background-color: ${color}; color: #ffffff; border-radius: 4px; font-size: 10px; font-weight: 600; width: 70px; height: 24px; box-sizing: border-box; white-space: nowrap; font-family: Inter, Arial, sans-serif; text-align: center; vertical-align: top; padding-top: 3px;">${badgeText}</div>`;
    };

    // Base styles for the page
    const baseStyles = `
      <style>
        * { font-family: 'Inter', 'Arial', sans-serif; box-sizing: border-box; }
        .page-container { width: 1123px; height: 794px; background: white; padding: 24px; position: relative; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .logo { width: 86px; height: auto; }
        .title { font-size: 20px; font-weight: 700; color: #111827; margin-left: 16px; }
        .company-info { font-size: 12px; color: #6b7280; text-align: right; line-height: 1.4; }
        .section-title { font-size: 18px; font-weight: 700; color: #1f2937; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .grid-item { font-size: 12px; color: #374151; }
        .label { font-weight: 600; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 11px; vertical-align: top; background: white; }
        th { background-color: #f9fafb; font-weight: 600; text-align: center; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); opacity: 0.1; font-size: 72px; font-weight: bold; color: #2c5530; z-index: 1; pointer-events: none; }
        .content { position: relative; z-index: 2; }
      </style>
    `;

    const riskifyLogo = '/attached_assets/slogan-6_1750823980552.png';
    const companyLogo = formData.companyLogo;

    switch (pageType) {
      case 'project-info':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Project Information</h2>
              <div class="grid">
                <div class="grid-item"><span class="label">Job Name:</span> ${formData.jobName}</div>
                <div class="grid-item"><span class="label">Job Number:</span> ${formData.jobNumber}</div>
                <div class="grid-item"><span class="label">Start Date:</span> ${formData.startDate}</div>
                <div class="grid-item"><span class="label">Duration:</span> ${formData.duration}</div>
                <div class="grid-item"><span class="label">Date Created:</span> ${formData.dateCreated}</div>
                <div class="grid-item"><span class="label">Principal Contractor:</span> ${formData.principalContractor}</div>
              </div>
              
              <h3 class="section-title">Project Details</h3>
              <div class="grid">
                <div class="grid-item"><span class="label">Project Manager:</span> ${formData.projectManager}</div>
                <div class="grid-item"><span class="label">Site Supervisor:</span> ${formData.siteSupervisor}</div>
                <div class="grid-item"><span class="label">Safety Officer:</span> ${formData.safetyOfficer}</div>
                <div class="grid-item"><span class="label">Client:</span> ${formData.client}</div>
                <div class="grid-item"><span class="label">Subcontractor:</span> ${formData.subcontractor}</div>
                <div class="grid-item"><span class="label">Permit Required:</span> ${formData.permitRequired ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        `;

      case 'emergency-info':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Emergency Information</h2>
              <div class="grid">
                <div class="grid-item"><span class="label">Emergency Contact:</span> ${formData.emergencyContact}</div>
                <div class="grid-item"><span class="label">Emergency Phone:</span> ${formData.emergencyPhone}</div>
                <div class="grid-item"><span class="label">Nearest Hospital:</span> ${formData.emergencyContact}</div>
                <div class="grid-item"><span class="label">Hospital Phone:</span> ${formData.emergencyPhone}</div>
                <div class="grid-item"><span class="label">Site Address:</span> ${formData.projectAddress}</div>
                <div class="grid-item"><span class="label">Assembly Point:</span> ${formData.assemblyPoint}</div>
              </div>
            </div>
          </div>
        `;

      case 'high-risk-activities':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">High Risk Activities</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 25%;">Activity</th>
                    <th style="width: 20%;">Hazards</th>
                    <th style="width: 15%;">Initial Risk</th>
                    <th style="width: 25%;">Control Measures</th>
                    <th style="width: 15%;">Residual Risk</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.highRiskActivities.map(activity => `
                    <tr>
                      <td>${activity.activity}</td>
                      <td>${activity.hazards.join(', ')}</td>
                      <td style="text-align: center;">
                        ${typeof activity.initialRisk === 'object' ? `${activity.initialRisk.level.charAt(0).toUpperCase() + activity.initialRisk.level.slice(1)} (${activity.initialRisk.score})` : activity.initialRisk}
                      </td>
                      <td>${activity.controlMeasures.join(', ')}</td>
                      <td style="text-align: center;">
                        ${typeof activity.residualRisk === 'object' ? `${activity.residualRisk.level.charAt(0).toUpperCase() + activity.residualRisk.level.slice(1)} (${activity.residualRisk.score})` : activity.residualRisk}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

      case 'work-activities':
        const startIndex = pageIndex * 2;
        const endIndex = startIndex + 2;
        const activitiesSlice = formData.workActivities.slice(startIndex, endIndex);
        
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Work Activities & Risk Assessment</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 25%;">Activity</th>
                    <th style="width: 20%;">Hazards</th>
                    <th style="width: 15%;">Initial Risk</th>
                    <th style="width: 25%;">Control Measures</th>
                    <th style="width: 15%;">Residual Risk</th>
                  </tr>
                </thead>
                <tbody>
                  ${activitiesSlice.map(activity => `
                    <tr>
                      <td>${activity.activity}</td>
                      <td>${activity.hazards.join(', ')}</td>
                      <td style="text-align: center;">
                        ${typeof activity.initialRisk === 'object' ? `${activity.initialRisk.level.charAt(0).toUpperCase() + activity.initialRisk.level.slice(1)} (${activity.initialRisk.score})` : activity.initialRisk}
                      </td>
                      <td>${activity.controlMeasures.join(', ')}</td>
                      <td style="text-align: center;">
                        ${typeof activity.residualRisk === 'object' ? `${activity.residualRisk.level.charAt(0).toUpperCase() + activity.residualRisk.level.slice(1)} (${activity.residualRisk.score})` : activity.residualRisk}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

      case 'ppe':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Personal Protective Equipment (PPE)</h2>
              <div class="grid">
                <div class="grid-item"><span class="label">Hard Hat:</span> ${formData.ppeRequirements.hardHat ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">Safety Glasses:</span> ${formData.ppeRequirements.safetyGlasses ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">Hearing Protection:</span> ${formData.ppeRequirements.hearingProtection ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">Respirator:</span> ${formData.ppeRequirements.respirator ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">Gloves:</span> ${formData.ppeRequirements.gloves ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">Safety Boots:</span> ${formData.ppeRequirements.safetyBoots ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">High Vis Clothing:</span> ${formData.ppeRequirements.highVisClothing ? 'Required' : 'Not Required'}</div>
                <div class="grid-item"><span class="label">Fall Protection:</span> ${formData.ppeRequirements.fallProtection ? 'Required' : 'Not Required'}</div>
              </div>
            </div>
          </div>
        `;

      case 'plant-equipment':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Plant & Equipment</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 25%;">Equipment</th>
                    <th style="width: 15%;">Model</th>
                    <th style="width: 20%;">Serial Number</th>
                    <th style="width: 15%;">Risk Level</th>
                    <th style="width: 15%;">Next Inspection</th>
                    <th style="width: 10%;">Certification</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.plantEquipment.map(equipment => `
                    <tr>
                      <td>${equipment.equipment}</td>
                      <td>${equipment.model}</td>
                      <td>${equipment.serialNumber}</td>
                      <td style="text-align: center;">${equipment.riskLevel ? equipment.riskLevel.charAt(0).toUpperCase() + equipment.riskLevel.slice(1).toLowerCase() : 'Low'}</td>
                      <td>${equipment.nextInspection}</td>
                      <td style="text-align: center;">${equipment.certificationRequired ? 'Yes' : 'No'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

      case 'sign-in':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Sign In Register</h2>
              <table>
                <thead>
                  <tr>
                    <th style="width: 20%;">Name</th>
                    <th style="width: 20%;">Company</th>
                    <th style="width: 15%;">Position</th>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 10%;">Time In</th>
                    <th style="width: 10%;">Time Out</th>
                    <th style="width: 10%;">Induction</th>
                    <th style="width: 5%;">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  ${formData.signInEntries.map(entry => `
                    <tr>
                      <td>${entry.name}</td>
                      <td>${entry.company}</td>
                      <td>${entry.position}</td>
                      <td>${entry.date}</td>
                      <td>${entry.timeIn}</td>
                      <td>${entry.timeOut}</td>
                      <td style="text-align: center;">${entry.inductionComplete ? '✓' : ''}</td>
                      <td>${entry.signature}</td>
                    </tr>
                  `).join('')}
                  ${Array.from({ length: 15 }, (_, i) => `
                    <tr>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

      case 'risk-matrix':
        return baseStyles + `
          <div class="page-container">
            <div class="watermark">RISKIFY</div>
            <div class="content">
              <div class="header">
                <div style="display: flex; align-items: center;">
                  <img src="${riskifyLogo}" alt="Riskify Logo" class="logo">
                  <h1 class="title">Safe Work Method Statement</h1>
                </div>
                <div class="company-info">
                  <div style="font-weight: 600; color: #374151;">${formData.companyName}</div>
                  <div>${formData.projectName}</div>
                  <div>${formData.projectNumber}</div>
                  <div>${formData.projectAddress}</div>
                  ${companyLogo ? `<img src="${companyLogo}" alt="Company Logo" style="width: 86px; height: auto; margin-top: 8px;">` : ''}
                </div>
              </div>
              
              <h2 class="section-title">Construction Control Risk Matrix</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th rowspan="2" style="width: 20%; vertical-align: middle; text-align: center;">Likelihood</th>
                    <th colspan="4" style="text-align: center;">Consequence</th>
                  </tr>
                  <tr>
                    <th style="width: 20%; text-align: center;">Minor (1)</th>
                    <th style="width: 20%; text-align: center;">Moderate (2)</th>
                    <th style="width: 20%; text-align: center;">Major (3)</th>
                    <th style="width: 20%; text-align: center;">Severe (4)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align: center; font-weight: 600;">Very Likely (4)</td>
                    <td style="text-align: center; background-color: #eab308; color: white; font-weight: 600;">Medium (4)</td>
                    <td style="text-align: center; background-color: #ea580c; color: white; font-weight: 600;">High (8)</td>
                    <td style="text-align: center; background-color: #dc2626; color: white; font-weight: 600;">Extreme (12)</td>
                    <td style="text-align: center; background-color: #dc2626; color: white; font-weight: 600;">Extreme (16)</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; font-weight: 600;">Likely (3)</td>
                    <td style="text-align: center; background-color: #22c55e; color: white; font-weight: 600;">Low (3)</td>
                    <td style="text-align: center; background-color: #eab308; color: white; font-weight: 600;">Medium (6)</td>
                    <td style="text-align: center; background-color: #ea580c; color: white; font-weight: 600;">High (9)</td>
                    <td style="text-align: center; background-color: #dc2626; color: white; font-weight: 600;">Extreme (12)</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; font-weight: 600;">Possible (2)</td>
                    <td style="text-align: center; background-color: #22c55e; color: white; font-weight: 600;">Low (2)</td>
                    <td style="text-align: center; background-color: #eab308; color: white; font-weight: 600;">Medium (4)</td>
                    <td style="text-align: center; background-color: #eab308; color: white; font-weight: 600;">Medium (6)</td>
                    <td style="text-align: center; background-color: #ea580c; color: white; font-weight: 600;">High (8)</td>
                  </tr>
                  <tr>
                    <td style="text-align: center; font-weight: 600;">Unlikely (1)</td>
                    <td style="text-align: center; background-color: #22c55e; color: white; font-weight: 600;">Low (1)</td>
                    <td style="text-align: center; background-color: #22c55e; color: white; font-weight: 600;">Low (2)</td>
                    <td style="text-align: center; background-color: #22c55e; color: white; font-weight: 600;">Low (3)</td>
                    <td style="text-align: center; background-color: #eab308; color: white; font-weight: 600;">Medium (4)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;

      default:
        return '';
    }
  };

  // React-PDF Styles for Vector Export
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 30,
      fontFamily: 'Helvetica'
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 30
    },
    logo: {
      width: 86,
      height: 'auto'
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#111827'
    },
    companyInfo: {
      fontSize: 11,
      color: '#6b7280',
      textAlign: 'right'
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 15
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20
    },
    gridItem: {
      width: '50%',
      marginBottom: 8,
      fontSize: 11
    },
    table: {
      display: 'table' as any,
      width: '100%',
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: '#d1d5db'
    },
    tableRow: {
      flexDirection: 'row'
    },
    tableHeader: {
      backgroundColor: '#f9fafb',
      color: '#374151',
      fontWeight: 'bold',
      fontSize: 10,
      padding: 8,
      textAlign: 'center' as any,
      border: '1px solid #d1d5db'
    },
    tableCell: {
      fontSize: 9,
      padding: 6,
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff'
    },
    riskBadge: {
      fontSize: 8,
      fontWeight: 'bold',
      padding: 3,
      borderRadius: 3,
      textAlign: 'center' as any,
      color: '#ffffff'
    }
  });

  // Vector PDF Export using React-PDF
  const exportVectorPdf = async () => {
    try {
      console.log('Starting vector PDF generation with React-PDF...');
      
      const SwmsDocument = () => (
        <Document>
          {/* Project Info Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Safe Work Method Statement</Text>
              </View>
              <View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
                <Text style={styles.companyInfo}>{formData.projectName}</Text>
                <Text style={styles.companyInfo}>{formData.projectNumber}</Text>
                <Text style={styles.companyInfo}>{formData.projectAddress}</Text>
                {formData.companyLogo && <Image src={formData.companyLogo} style={styles.logo} />}
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Project Information</Text>
            <View style={styles.gridContainer}>
              <Text style={styles.gridItem}>Job Name: {formData.jobName}</Text>
              <Text style={styles.gridItem}>Job Number: {formData.jobNumber}</Text>
              <Text style={styles.gridItem}>Start Date: {formData.startDate}</Text>
              <Text style={styles.gridItem}>Duration: {formData.duration}</Text>
              <Text style={styles.gridItem}>Date Created: {formData.dateCreated}</Text>
              <Text style={styles.gridItem}>Principal Contractor: {formData.principalContractor}</Text>
            </View>
          </Page>

          {/* Emergency Info Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Emergency Information</Text>
              </View>
              <View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
              </View>
            </View>
            
            <View style={styles.gridContainer}>
              <Text style={styles.gridItem}>Emergency Contacts: {formData.emergencyContacts?.map(c => `${c.name}: ${c.phone}`).join(', ') || 'None specified'}</Text>
              <Text style={styles.gridItem}>Site Address: {formData.projectAddress}</Text>
              <Text style={styles.gridItem}>Nearest Hospital: {formData.nearestHospital || 'Not specified'}</Text>
              <Text style={styles.gridItem}>Hospital Phone: {formData.hospitalPhone || 'Not specified'}</Text>
              <Text style={styles.gridItem}>Site Supervisor: {formData.siteSupervisor}</Text>
              <Text style={styles.gridItem}>Site Supervisor Phone: {formData.siteSupervisor || 'Not specified'}</Text>
            </View>
          </Page>

          {/* High Risk Activities Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>High Risk Activities</Text>
              </View>
              <View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
              </View>
            </View>
            
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { width: '40%' }]}>High Risk Activity</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>License Required</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Training Required</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Supervision Level</Text>
              </View>
              
              {formData.highRiskActivities.map((activity, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '40%' }]}>{activity.title}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{activity.selected ? 'Yes' : 'No'}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{activity.riskLevel ? 'Required' : 'Standard'}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{activity.riskLevel || 'Standard'}</Text>
                </View>
              ))}
            </View>
          </Page>

          {/* Risk Matrix Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Risk Assessment Matrix</Text>
              </View>
              <View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
              </View>
            </View>
            
            <Text style={styles.sectionTitle}>Risk Matrix - Consequence vs Likelihood</Text>
            
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Likelihood</Text>
                <Text style={[styles.tableHeader, { width: '16%' }]}>Insignificant (1)</Text>
                <Text style={[styles.tableHeader, { width: '16%' }]}>Minor (2)</Text>
                <Text style={[styles.tableHeader, { width: '16%' }]}>Moderate (3)</Text>
                <Text style={[styles.tableHeader, { width: '16%' }]}>Major (4)</Text>
                <Text style={[styles.tableHeader, { width: '16%' }]}>Catastrophic (5)</Text>
              </View>
              
              {['Almost Certain (5)', 'Likely (4)', 'Possible (3)', 'Unlikely (2)', 'Rare (1)'].map((likelihood, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '20%', fontWeight: 'bold' }]}>{likelihood}</Text>
                  {[1, 2, 3, 4, 5].map((consequence, colIndex) => {
                    const score = (5 - rowIndex) * consequence;
                    const level = score >= 15 ? 'Extreme' : score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low';
                    const color = score >= 15 ? '#dc2626' : score >= 10 ? '#ea580c' : score >= 5 ? '#eab308' : '#22c55e';
                    return (
                      <View key={colIndex} style={[styles.tableCell, { width: '16%', backgroundColor: color }]}>
                        <Text style={{ color: '#ffffff', fontSize: 8, textAlign: 'center' }}>
                          {level} ({score})
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </Page>

          {/* Work Activities Pages */}
          {Array.from({ length: Math.ceil(formData.workActivities.length / 2) }, (_, pageIndex) => (
            <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
              <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image src={riskifyLogo} style={styles.logo} />
                  <Text style={[styles.title, { marginLeft: 15 }]}>Work Activities & Risk Assessment</Text>
                </View>
                <Text style={styles.companyInfo}>{formData.companyName}</Text>
              </View>
              
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableHeader, { width: '25%' }]}>Activity</Text>
                  <Text style={[styles.tableHeader, { width: '20%' }]}>Hazards</Text>
                  <Text style={[styles.tableHeader, { width: '15%' }]}>Initial Risk</Text>
                  <Text style={[styles.tableHeader, { width: '25%' }]}>Control Measures</Text>
                  <Text style={[styles.tableHeader, { width: '15%' }]}>Residual Risk</Text>
                </View>
                
                {formData.workActivities.slice(pageIndex * 2, (pageIndex + 1) * 2).map((activity, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{activity.activity}</Text>
                    <Text style={[styles.tableCell, { width: '20%' }]}>{activity.hazards.join(', ')}</Text>
                    <Text style={[styles.tableCell, { width: '15%' }]}>
                      {typeof activity.initialRisk === 'object' ? `${activity.initialRisk.level} (${activity.initialRisk.score})` : activity.initialRisk}
                    </Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{activity.controlMeasures.join(', ')}</Text>
                    <Text style={[styles.tableCell, { width: '15%' }]}>
                      {typeof activity.residualRisk === 'object' ? `${activity.residualRisk.level} (${activity.residualRisk.score})` : activity.residualRisk}
                    </Text>
                  </View>
                ))}
              </View>
            </Page>
          ))}

          {/* PPE Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Personal Protective Equipment (PPE)</Text>
              </View>
              <Text style={styles.companyInfo}>{formData.companyName}</Text>
            </View>
            
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { width: '30%' }]}>PPE Item</Text>
                <Text style={[styles.tableHeader, { width: '35%' }]}>Description</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Required</Text>
                <Text style={[styles.tableHeader, { width: '15%' }]}>Selected</Text>
              </View>
              
              {formData.ppeItems.map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '30%' }]}>{item.name}</Text>
                  <Text style={[styles.tableCell, { width: '35%' }]}>{item.description}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{item.required ? 'Yes' : 'No'}</Text>
                  <Text style={[styles.tableCell, { width: '15%' }]}>{item.selected ? 'Yes' : 'No'}</Text>
                </View>
              ))}
            </View>
          </Page>

          {/* Plant & Equipment Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Plant & Equipment</Text>
              </View>
              <Text style={styles.companyInfo}>{formData.companyName}</Text>
            </View>
            
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { width: '25%' }]}>Equipment</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Model</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Serial Number</Text>
                <Text style={[styles.tableHeader, { width: '15%' }]}>Risk Level</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Next Inspection</Text>
              </View>
              
              {formData.plantEquipment.map((equipment, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{equipment.equipment}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{equipment.model || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{equipment.serialNumber || 'N/A'}</Text>
                  <Text style={[styles.tableCell, { width: '15%' }]}>{equipment.riskLevel}</Text>
                  <Text style={[styles.tableCell, { width: '20%' }]}>{equipment.nextInspection || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </Page>

          {/* Sign In Page */}
          <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image src={riskifyLogo} style={styles.logo} />
                <Text style={[styles.title, { marginLeft: 15 }]}>Sign In Register</Text>
              </View>
              <Text style={styles.companyInfo}>{formData.companyName}</Text>
            </View>
            
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Name</Text>
                <Text style={[styles.tableHeader, { width: '20%' }]}>Company</Text>
                <Text style={[styles.tableHeader, { width: '15%' }]}>Date</Text>
                <Text style={[styles.tableHeader, { width: '15%' }]}>Time In</Text>
                <Text style={[styles.tableHeader, { width: '15%' }]}>Time Out</Text>
                <Text style={[styles.tableHeader, { width: '15%' }]}>Signature</Text>
              </View>
              
              {/* Empty rows for signing */}
              {Array.from({ length: 15 }, (_, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { width: '20%', height: 25 }]}></Text>
                  <Text style={[styles.tableCell, { width: '20%', height: 25 }]}></Text>
                  <Text style={[styles.tableCell, { width: '15%', height: 25 }]}></Text>
                  <Text style={[styles.tableCell, { width: '15%', height: 25 }]}></Text>
                  <Text style={[styles.tableCell, { width: '15%', height: 25 }]}></Text>
                  <Text style={[styles.tableCell, { width: '15%', height: 25 }]}></Text>
                </View>
              ))}
            </View>
          </Page>
        </Document>
      );

      // Generate the PDF
      const pdfBlob = await pdf(<SwmsDocument />).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      const projectName = formData.projectName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Untitled_Project';
      link.download = `SWMS_${projectName}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Vector PDF generated successfully!');
      
    } catch (error) {
      console.error('Vector PDF export failed:', error);
      alert('Vector PDF export failed. Please try again.');
    }
  };

  const renderAllPagesForPDF = () => {
    const riskLevels = {
      'extreme': { color: '#dc2626', text: 'white' },
      'high': { color: '#ea580c', text: 'white' },
      'medium': { color: '#eab308', text: 'white' },
      'low': { color: '#22c55e', text: 'white' }
    };

    const getRiskBadge = (level: string, score: number | string) => {
      const risk = riskLevels[level as keyof typeof riskLevels] || riskLevels.medium;
      
      const badgeText = score === '' || score === 0 ? 
        level.charAt(0).toUpperCase() + level.slice(1) : 
        `${level.charAt(0).toUpperCase() + level.slice(1)} (${score})`;
      
      return `<div style="display: inline-block; background-color: ${risk.color}; color: #ffffff; border-radius: 4px; font-size: 10px; font-weight: 600; width: 70px; height: 24px; box-sizing: border-box; white-space: nowrap; font-family: Inter, Arial, sans-serif; text-align: center; vertical-align: top; padding-top: 3px;">${badgeText}</div>`;
    };

    return `
      <!-- Project Info Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
            <div style="font-size: 24px; font-weight: 600; color: #111827;">Safe Work Method Statement</div>
          </div>
          <div style="display: flex; align-items: center; gap: 32px;">
            <div style="text-align: right; font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
            <div style="flex-shrink: 0;">
              ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="height: 86px; width: auto; object-fit: contain;" />` : '<div style="height: 86px; width: 120px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Project Information</h1>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div><strong>Job Name:</strong> ${formData.jobName}</div>
            <div><strong>Job Number:</strong> ${formData.jobNumber}</div>
            <div><strong>Start Date:</strong> ${formData.startDate}</div>
            <div><strong>Duration:</strong> ${formData.duration}</div>
            <div><strong>Date Created:</strong> ${formData.dateCreated}</div>
            <div><strong>Principal Contractor:</strong> ${formData.principalContractor}</div>
            <div><strong>Project Manager:</strong> ${formData.projectManager}</div>
            <div><strong>Site Supervisor:</strong> ${formData.siteSupervisor}</div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <div><strong>Authorising Person:</strong> ${formData.authorisingPerson}</div>
            <div style="margin-top: 8px;"><strong>Position:</strong> ${formData.authorisingPosition}</div>
            <div style="margin-top: 12px;">
              <strong>Signature:</strong>
              <div style="margin-top: 4px; padding: 8px 12px; border-bottom: 2px solid #374151; min-height: 40px; font-family: 'Dancing Script', cursive; font-size: 18px; font-weight: 600; color: #1f2937;">
                ${formData.authorisingSignature || ''}
              </div>
            </div>
          </div>
          
          <div>
            <strong>Scope of Works:</strong>
            <div style="margin-top: 8px; padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; min-height: 100px;">${formData.scopeOfWorks}</div>
          </div>
        </div>
      </div>

      <!-- Emergency Info Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Emergency Contact Information</h1>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600;">Name</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600;">Phone</th>
              </tr>
            </thead>
            <tbody>
              ${formData.emergencyContacts.map(contact => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${contact.name}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${contact.phone}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-bottom: 20px;">
            <strong>Emergency Procedures:</strong>
            <div style="margin-top: 8px; padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; min-height: 80px;">${formData.emergencyProcedures}</div>
          </div>
          
          <div>
            <strong>Monitoring & Review Requirements:</strong>
            <div style="margin-top: 8px; padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; min-height: 80px;">${formData.emergencyMonitoring}</div>
          </div>
        </div>
      </div>

      <!-- High Risk Activities Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">High Risk Activities</h1>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            ${formData.highRiskActivities.filter(activity => activity.selected).map(activity => `
              <div style="border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; background: #f9fafb;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">${activity.title}</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 12px;">${activity.description}</div>
                ${activity.riskLevel ? `<div style="text-align: center;">${getRiskBadge(activity.riskLevel, 0)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Risk Matrix Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Risk Assessment Matrix</h1>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            <!-- Likelihood Matrix -->
            <div>
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Likelihood Assessment</h3>
              <table style="width: 100%; border-collapse: collapse; border: 2px solid #374151;">
                <thead>
                  <tr>
                    <th style="background-color: #f8fafc; color: #1f2937; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Likelihood</th>
                    <th style="background-color: #f8fafc; color: #1f2937; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Frequency</th>
                    <th style="background-color: #f8fafc; color: #1f2937; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Probability</th>
                    <th style="background-color: #f8fafc; color: #1f2937; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="background-color: white; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">5</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Almost Certain</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Daily / Weekly</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">>90%</td></tr>
                  <tr><td style="background-color: #fefefe; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">4</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Likely</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Monthly</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">61-90%</td></tr>
                  <tr><td style="background-color: white; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">3</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Possible</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Yearly</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">31-60%</td></tr>
                  <tr><td style="background-color: #fefefe; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">2</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Unlikely</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">5-10 Years</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">11-30%</td></tr>
                  <tr><td style="background-color: white; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">1</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Rare</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">>10 Years</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;"><10%</td></tr>
                </tbody>
              </table>
            </div>
            
            <!-- Consequence Matrix -->
            <div>
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Consequence Assessment</h3>
              <table style="width: 100%; border-collapse: collapse; border: 2px solid #374151;">
                <thead>
                  <tr>
                    <th style="background-color: #f8fafc; color: #374151; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Consequence</th>
                    <th style="background-color: #f8fafc; color: #374151; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">People</th>
                    <th style="background-color: #f8fafc; color: #374151; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Environment</th>
                    <th style="background-color: #f8fafc; color: #374151; padding: 8px; text-align: center; border: 1px solid #e5e7eb;">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style="background-color: white; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">5</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Fatality</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Major Environmental Impact</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Catastrophic</td></tr>
                  <tr><td style="background-color: #fefefe; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">4</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Permanent Disability</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Significant Environmental Impact</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Major</td></tr>
                  <tr><td style="background-color: white; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">3</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Lost Time Injury</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Moderate Environmental Impact</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Moderate</td></tr>
                  <tr><td style="background-color: #fefefe; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">2</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Medical Treatment</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Minor Environmental Impact</td><td style="background-color: #fefefe; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Minor</td></tr>
                  <tr><td style="background-color: white; color: #374151; padding: 8px; text-align: center; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">1</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">First Aid</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Negligible Environmental Impact</td><td style="background-color: white; color: #374151; padding: 8px; vertical-align: top; padding-top: 6px; border: 1px solid #e5e7eb;">Negligible</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Work Activities Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Work Activities</h1>
          
          <table class="work-activities-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 3%;">#</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 14%;">Activity</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 23%;">Hazards</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 11%;">Initial Risk</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 27%;">Control Measures</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 11%;">Residual Risk</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 11%;">Legislation</th>
              </tr>
            </thead>
            <tbody>
              ${formData.workActivities.map((activity, index) => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: center; font-size: 10px; background-color: white;">${index + 1}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; padding-left: 12px; font-size: 10px; background-color: white;">${activity.activity}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 10px; background-color: white;"><ul style="margin: 0; padding-left: 12px;">${activity.hazards.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}</ul></td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: center; vertical-align: top; padding-top: 6px; font-size: 10px; background-color: white;">${getRiskBadge(activity.initialRisk.level, activity.initialRisk.score)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 10px; background-color: white;"><ul style="margin: 0; padding-left: 12px;">${activity.controlMeasures.map(c => `<li style="margin-bottom: 2px;">${c}</li>`).join('')}</ul></td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: center; vertical-align: top; padding-top: 6px; font-size: 10px; background-color: white;">${getRiskBadge(activity.residualRisk.level, activity.residualRisk.score)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 10px; background-color: white;"><ul style="margin: 0; padding-left: 12px;">${activity.legislation.map(l => `<li style="margin-bottom: 2px;">${l}</li>`).join('')}</ul></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- PPE Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Personal Protective Equipment (PPE)</h1>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            ${(formData.ppeItems || []).filter(item => item.selected).map(item => `
              <div style="border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; background: #f9fafb;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">${item.name}</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${item.description}</div>
                <div style="font-size: 11px; color: #059669; font-weight: 500;">Category: ${item.category}</div>
                ${item.required ? '<div style="font-size: 10px; color: #dc2626; font-weight: 600; margin-top: 4px;">REQUIRED</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Plant & Equipment Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white; page-break-after: always;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Plant & Equipment</h1>
          
          <table class="plant-equipment-table" style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 17%;">Equipment</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 26%;">Hazards</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 11%;">Initial Risk</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 31%;">Control Measures</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 11%;">Residual Risk</th>
                <th style="border: 1px solid #e5e7eb; padding: 6px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 4%;">Legislation</th>
              </tr>
            </thead>
            <tbody>
              ${(formData.plantEquipment || []).map(equipment => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; padding-left: 12px; font-size: 10px; background-color: white;">${equipment.equipment}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 10px; background-color: white;"><ul style="margin: 0; padding-left: 12px;">${equipment.hazards.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}</ul></td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: center; vertical-align: top; padding-top: 6px; font-size: 10px; background-color: white;">${getRiskBadge(equipment.initialRisk.level, equipment.initialRisk.score)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 10px; background-color: white;"><ul style="margin: 0; padding-left: 12px;">${equipment.controlMeasures.map(c => `<li style="margin-bottom: 2px;">${c}</li>`).join('')}</ul></td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: center; vertical-align: top; padding-top: 6px; font-size: 10px; background-color: white;">${getRiskBadge(equipment.residualRisk.level, equipment.residualRisk.score)}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 6px; text-align: left; font-size: 10px; background-color: white;"><ul style="margin: 0; padding-left: 12px;">${equipment.legislation.map(l => `<li style="margin-bottom: 2px;">${l}</li>`).join('')}</ul></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sign In Register Page -->
      <div style="width: 100%; min-height: 794px; padding: 40px; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div style="flex-shrink: 0;">
            <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 86px; width: auto;" />
          </div>
          <div style="text-align: center; flex: 1; margin: 0 32px;">
            <div style="font-size: 13px; line-height: 18px; color: #6b7280;">
              <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
              <div>${formData.projectName}</div>
              <div>${formData.projectNumber}</div>
              <div>${formData.projectAddress}</div>
            </div>
          </div>
          <div style="flex-shrink: 0;">
            ${formData.companyLogo ? `<img src="${formData.companyLogo}" alt="Company Logo" style="width: 140px; height: 88px; object-fit: contain;" />` : '<div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af;">Company Logo</div>'}
          </div>
        </div>

        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 24px;">Site Sign-In Register</h1>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 25%;">Name</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 15%;">Company</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 20%;">Date</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 15%;">Time In</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 15%;">Time Out</th>
                <th style="border: 1px solid #e5e7eb; padding: 8px; background-color: #f9fafb; color: #1f2937; text-align: center; font-weight: 600; width: 10%;">Signature</th>
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: 15 }, (_, index) => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; height: 30px;"></td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; height: 30px;"></td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; height: 30px;"></td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; height: 30px;"></td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; height: 30px;"></td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px; height: 30px;"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // Print page renderers
  const renderProjectInfoPageForPrint = () => `
    <div class="swms-page page-break">
      <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 40px;">
        <div style="flex-shrink: 0;">
          <img src="${riskifyLogo}" alt="Riskify Logo" style="height: 101px; width: auto;" />
        </div>
        <div style="text-align: center; margin: 0 32px; flex: 1;">
          <div style="font-size: 13px; line-height: 18px; color: #6b7280; font-family: Inter, system-ui, sans-serif;">
            <div style="font-weight: 500; color: #374151;">${formData.companyName}</div>
            <div>${formData.projectName}</div>
            <div>${formData.projectNumber}</div>
            <div>${formData.projectAddress}</div>
          </div>
        </div>
        <div style="flex-shrink: 0;">
          <div style="width: 140px; height: 88px; border: 2px dashed #d1d5db; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; color: #9ca3af; line-height: 14px;">
            Insert company logo here
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="font-weight: bold; font-size: 32px; color: #2c5530; font-family: Inter, system-ui, sans-serif; margin: 0;">
          Safe Work Method Statement
        </h1>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div>
          <h2 style="font-size: 18px; font-weight: 600; color: #2c5530; margin-bottom: 20px;">Project Information</h2>
          <div style="space-y: 16px;">
            <div><strong>Job Name:</strong> ${formData.jobName}</div>
            <div><strong>Job Number:</strong> ${formData.jobNumber}</div>
            <div><strong>Project Address:</strong> ${formData.projectAddress}</div>
            <div><strong>Start Date:</strong> ${formData.startDate}</div>
            <div><strong>Duration:</strong> ${formData.duration}</div>
            <div><strong>Date Created:</strong> ${formData.dateCreated}</div>
          </div>
        </div>
        <div>
          <h2 style="font-size: 18px; font-weight: 600; color: #2c5530; margin-bottom: 20px;">Personnel</h2>
          <div style="space-y: 16px;">
            <div><strong>Principal Contractor:</strong> ${formData.principalContractor}</div>
            <div><strong>Project Manager:</strong> ${formData.projectManager}</div>
            <div><strong>Site Supervisor:</strong> ${formData.siteSupervisor}</div>
            <div><strong>Authorising Person:</strong> ${formData.authorisingPerson}</div>
            <div><strong>Position:</strong> ${formData.authorisingPosition}</div>
          </div>
        </div>
      </div>
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #2c5530; margin-bottom: 20px;">Scope of Works</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 20px;">
          ${formData.scopeOfWorks}
        </div>
      </div>
      <div>
        <h2 style="font-size: 18px; font-weight: 600; color: #2c5530; margin-bottom: 20px;">Review and Monitoring</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 20px;">
          ${formData.reviewAndMonitoring}
        </div>
      </div>
    </div>
  `;

  const renderProjectInfoPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Information Section */}
        <div className="mb-8">
          <h2 className="font-bold mb-6" style={{ 
            fontSize: '24px',
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Project Information
          </h2>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left Card */}
            <div className="bg-white border rounded-lg p-5" style={{ 
              borderColor: '#e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div className="space-y-3">
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Company Name: </span>
                  <span style={{ color: '#111827' }}>{formData.companyName}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Job Name: </span>
                  <span style={{ color: '#111827' }}>{formData.jobName}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Job Number: </span>
                  <span style={{ color: '#111827' }}>{formData.jobNumber}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Project Address: </span>
                  <span style={{ color: '#111827' }}>{formData.projectAddress}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Start Date: </span>
                  <span style={{ color: '#111827' }}>{formData.startDate}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Duration: </span>
                  <span style={{ color: '#111827' }}>{formData.duration}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Date Created: </span>
                  <span style={{ color: '#111827' }}>{formData.dateCreated}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Principal Contractor: </span>
                  <span style={{ color: '#111827' }}>{formData.principalContractor}</span>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-white border rounded-lg p-5" style={{ 
              borderColor: '#e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
              <div className="space-y-3">
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Project Manager: </span>
                  <span className="italic" style={{ color: '#111827' }}>{formData.projectManager}</span>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <span className="font-semibold" style={{ color: '#111827' }}>Site Supervisor: </span>
                  <span className="italic" style={{ color: '#111827' }}>{formData.siteSupervisor}</span>
                </div>
                <div className="mt-4" style={{ fontSize: '13px', lineHeight: '18px' }}>
                  <div className="font-semibold underline mb-2" style={{ color: '#111827' }}>Person Authorising SWMS</div>
                  <div>Name: <span className="italic" style={{ color: '#111827' }}>{formData.authorisingPerson}</span></div>
                  <div>Position: <span className="italic" style={{ color: '#111827' }}>{formData.authorisingPosition}</span></div>
                  <div className="mt-3">
                    <div className="mb-1">Signature:</div>
                    <div style={{
                      padding: '0.5rem 1rem',
                      borderBottom: '2px solid #374151',
                      minHeight: '3rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}>
                      {formData.authorisingSignature ? (
                        <img 
                          src={formData.authorisingSignature} 
                          alt="Authorising Person Signature" 
                          style={{ 
                            maxHeight: '40px', 
                            maxWidth: '200px',
                            objectFit: 'contain'
                          }}
                        />
                      ) : formData.authorisingSignatureName ? (
                        <div style={{
                          fontFamily: 'Dancing Script, cursive',
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#1f2937'
                        }}>
                          {formData.authorisingSignatureName}
                        </div>
                      ) : (
                        <div style={{
                          fontFamily: 'Dancing Script, cursive',
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          No signature provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scope of Works Section */}
        <div className="mt-6">
          <div className="bg-white border rounded-lg p-5" style={{ 
            borderColor: '#e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 className="font-semibold mb-4" style={{ 
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Scope of Works
            </h2>
            <div className="whitespace-pre-line" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#111827'
            }}>
              {formData.scopeOfWorks}
            </div>
          </div>
        </div>

        {/* Review and Monitoring Section */}
        <div className="mt-6">
          <div className="bg-white border rounded-lg p-5" style={{ 
            borderColor: '#e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 className="font-semibold mb-4" style={{ 
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Review and Monitoring
            </h2>
            <div className="whitespace-pre-line" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#111827'
            }}>
              {formData.reviewAndMonitoring}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderEmergencyInfoPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Emergency Information
          </h1>
        </div>

        {/* Emergency Contacts Section */}
        <div className="mb-8">
          <div className="bg-white border rounded-lg p-6" style={{ 
            borderColor: '#e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 className="font-semibold mb-4" style={{ 
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Emergency Contacts
            </h2>
            <div className="space-y-2">
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} style={{ fontSize: '13px', lineHeight: '18px', color: '#111827' }}>
                  {contact.name} - {contact.phone}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Response Procedures Section */}
        <div className="mb-8">
          <div className="bg-white border rounded-lg p-6" style={{ 
            borderColor: '#e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 className="font-semibold mb-4" style={{ 
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Emergency Response Procedures
            </h2>
            <div className="whitespace-pre-line" style={{ 
              fontSize: '14px', 
              lineHeight: '20px',
              color: '#1f2937'
            }}>
              {formData.emergencyProcedures}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white border rounded-lg p-6" style={{ 
            borderColor: '#e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }}>
            <h2 className="font-semibold mb-4" style={{ 
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Monitoring & Review Requirements
            </h2>
            <div className="whitespace-pre-line" style={{ 
              fontSize: '14px', 
              lineHeight: '20px',
              color: '#1f2937'
            }}>
              {formData.emergencyMonitoring}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderHighRiskActivitiesPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            High Risk Activities
          </h1>
        </div>

        {/* High Risk Activities Grid */}
        <div className="grid grid-cols-4 gap-4">
          {(() => {
            const allActivities = formData.highRiskActivities;
            const totalActivities = allActivities.length;
            const result = [];
            
            // Add all activities
            allActivities.forEach((activity, index) => {
              result.push(
                <div 
                  key={activity.id} 
                  className={`border rounded-lg p-4 text-center flex items-center justify-center ${
                    activity.selected 
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  style={{ 
                    fontSize: '11px', 
                    lineHeight: '15px',
                    color: activity.selected ? '#ea580c' : '#111827',
                    minHeight: '80px'
                  }}
                >
                  <div className="font-medium">
                    {activity.title}
                  </div>
                </div>
              );
            });
            
            // If the last row has exactly 2 items, add a blank card at the beginning of that row
            const remainingInLastRow = totalActivities % 4;
            if (remainingInLastRow === 2) {
              // Insert blank card before the last two cards
              const lastRowStart = Math.floor((totalActivities - 1) / 4) * 4;
              result.splice(lastRowStart, 0, 
                <div 
                  key="blank-spacer" 
                  style={{ minHeight: '80px' }}
                />
              );
            }
            
            return result;
          })()}
        </div>

      </div>
    </div>
  );

  const renderRiskMatrixPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Construction Control Risk Matrix
          </h1>
        </div>

        {/* Four tables in a 2x2 grid layout with consistent sizing */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Likelihood Definitions */}
          <div>
            <div className="risk-matrix-table" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '1px',
              fontSize: '12px',
              backgroundColor: '#e5e7eb',
              border: '1px solid #d1d5db'
            }}>
              {/* Headers */}
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#1f2937' }}>Likelihood</div>
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#1f2937' }}>Frequency</div>
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#1f2937' }}>Probability</div>
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#1f2937' }}>Value</div>
              
              {/* Rows */}
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Almost Certain</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Weekly</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Very high</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
              
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Likely</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Monthly</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Good</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
              
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Possible</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yearly</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Even</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
              
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Unlikely</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>10 years</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Low</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Rare</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Lifetime</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No chance</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
            </div>
          </div>

          {/* Consequence Definitions */}
          <div>
            <div className="risk-matrix-table" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 2fr 1fr', 
              gap: '1px',
              fontSize: '12px',
              backgroundColor: '#e5e7eb',
              border: '1px solid #d1d5db'
            }}>
              {/* Headers */}
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151' }}>Consequence</div>
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151' }}>Description</div>
              <div className="p-2 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151' }}>Value</div>
              
              {/* Rows */}
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Catastrophic</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Fatality, disability, $50,000+</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
              
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Major</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Amputation, $15,000-$50,000</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
              
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Moderate</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LTI/MTI, $1,000-$15,000</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
              
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Minor</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>First Aid, $100-$1,000</div>
              <div className="p-2" style={{ backgroundColor: '#fefefe', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Insignificant</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#374151', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No treatment, $0-$100</div>
              <div className="p-2" style={{ backgroundColor: 'white', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
            </div>
          </div>

          {/* Risk Assessment Matrix */}
          <div>
            <div className="risk-matrix-table" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)', 
              gap: '1px',
              fontSize: '12px',
              backgroundColor: '#e5e7eb',
              border: '1px solid #d1d5db'
            }}>
              {/* Headers */}
              <div className="p-1 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151', fontSize: '10px', lineHeight: '1.1', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Likelihood→<br/>Consequence↓
              </div>
              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '48px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>5</span></div>
              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '48px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>4</span></div>
              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '48px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>3</span></div>
              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '48px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>2</span></div>
              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '48px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>1</span></div>

              {/* Matrix rows */}
              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>5</span></div>
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>25</span></div>
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>20</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>15</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>10</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>5</span></div>

              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>4</span></div>
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>20</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>16</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>12</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>8</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>4</span></div>

              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>3</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>15</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>12</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>9</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>6</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>3</span></div>

              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>2</span></div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>10</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>8</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>6</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>4</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>2</span></div>

              <div className="p-3" style={{ backgroundColor: '#f8fafc', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>1</span></div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>5</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>4</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>3</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>2</span></div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', position: 'relative', minHeight: '40px', fontWeight: 'normal' }}><span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>1</span></div>
            </div>
          </div>

          {/* Risk Rating Guide */}
          <div>
            <div className="risk-matrix-table" style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 2fr 1fr', 
              gap: '1px',
              fontSize: '12px',
              backgroundColor: '#e5e7eb',
              border: '1px solid #d1d5db'
            }}>
              {/* Headers */}
              <div className="p-3 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Range</div>
              <div className="p-3 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Risk</div>
              <div className="p-3 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Action Required</div>
              <div className="p-3 text-center font-semibold" style={{ backgroundColor: '#f8fafc', color: '#374151', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Timeline</div>
              
              {/* Rows */}
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>20-25</div>
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#7f1d1d', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minHeight: '40px' }}>EXTREME</div>
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#7f1d1d', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>Stop immediately</div>
              <div className="p-3" style={{ backgroundColor: '#fca5a5', color: '#7f1d1d', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>Now</div>
              
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>10-16</div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#9a3412', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minHeight: '40px' }}>HIGH</div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#9a3412', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>Senior management</div>
              <div className="p-3" style={{ backgroundColor: '#fed7aa', color: '#9a3412', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>24hrs</div>
              
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>5-9</div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#92400e', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minHeight: '40px' }}>MEDIUM</div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#92400e', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>Management action</div>
              <div className="p-3" style={{ backgroundColor: '#fef3c7', color: '#92400e', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>48hrs</div>
              
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>1-4</div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#166534', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', minHeight: '40px' }}>LOW</div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#166534', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>Routine procedures</div>
              <div className="p-3" style={{ backgroundColor: '#bbf7d0', color: '#166534', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40px' }}>5 days</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  // Helper function to chunk activities into pages based on safer row limits
  const chunkActivitiesIntoPages = () => {
    const pages = [];
    const activities = formData.workActivities || [];
    
    // Use a conservative approach - limit to 2 rows per page for activities with lots of content
    const maxRowsPerPage = 2; // Much safer limit to prevent overflow
    
    for (let i = 0; i < activities.length; i += maxRowsPerPage) {
      pages.push(activities.slice(i, i + maxRowsPerPage));
    }
    
    return pages.length > 0 ? pages : [[]]; // Return at least one empty page
  };

  // Helper function to chunk sign-in entries into pages
  const chunkSignInIntoPages = () => {
    const pages = [];
    const entries = formData.signInEntries || [];
    
    // Allow 12 rows per page for sign-in
    const maxRowsPerPage = 12;
    
    // Always ensure we have blank rows to fill up to maxRowsPerPage
    let totalRowsNeeded = Math.max(maxRowsPerPage, entries.length);
    
    // If we have more entries than can fit on one page, we need multiple pages
    if (entries.length > maxRowsPerPage) {
      // Calculate how many pages we need
      const totalPages = Math.ceil(entries.length / maxRowsPerPage);
      totalRowsNeeded = totalPages * maxRowsPerPage;
    }
    
    // Create entries array with blanks to fill pages
    const allRows = [...entries];
    while (allRows.length < totalRowsNeeded) {
      allRows.push({ name: '', number: '', signature: '', date: '', inductionComplete: false });
    }
    
    // Chunk into pages
    for (let i = 0; i < allRows.length; i += maxRowsPerPage) {
      pages.push(allRows.slice(i, i + maxRowsPerPage));
    }
    
    return pages.length > 0 ? pages : [Array(maxRowsPerPage).fill({ name: '', number: '', signature: '', date: '', inductionComplete: false })];
  };

  const renderWorkActivitiesPages = () => {
    const activityPages = chunkActivitiesIntoPages();
    
    // For PDF generation, show only the current page index
    // For live preview, show all pages
    const pagesToShow = activityPages.slice(currentWorkActivitiesPageIndex, currentWorkActivitiesPageIndex + 1);
    
    return (
      <div className="space-y-8">
        {pagesToShow.map((pageActivities, relativeIndex) => {
          const pageIndex = currentWorkActivitiesPageIndex + relativeIndex;
          return (
          <div key={pageIndex} className="bg-white shadow-lg mx-auto print-page relative page-break" style={{ width: '1123px', minHeight: '794px' }}>
            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <div 
                      className="text-gray-200 font-bold select-none opacity-30"
                      style={{ 
                        fontSize: '20px',
                        transform: 'rotate(-45deg)',
                        whiteSpace: 'nowrap',
                        lineHeight: '24px',
                        textAlign: 'center'
                      }}
                    >
                      <div>{formData.companyName}</div>
                      <div>{formData.projectName}</div>
                      <div>{formData.projectNumber}</div>
                      <div>{formData.projectAddress}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
              
              {/* Header Section */}
              <div className="flex items-start justify-between mb-10">
                <div className="flex items-center space-x-6 flex-shrink-0">
                  <img 
                    src={riskifyLogo} 
                    alt="Riskify Logo" 
                    style={{ height: '78px', width: 'auto' }}
                  />
                  <h1 className="font-bold" style={{ 
                    fontSize: '24px', 
                    color: '#1f2937',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    lineHeight: '1.2'
                  }}>
                    Safe Work Method Statement
                  </h1>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right" style={{ 
                    fontSize: '13px', 
                    lineHeight: '18px',
                    color: '#6b7280',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    lineHeight: '1.2'
                  }}>
                    <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
                    <div>{formData.projectName}</div>
                    <div>{formData.projectNumber}</div>
                    <div>{formData.projectAddress}</div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {formData.companyLogo ? (
                      <img 
                        src={formData.companyLogo} 
                        alt="Company Logo" 
                        style={{ 
                          width: '140px', 
                          height: '88px', 
                          objectFit: 'contain' 
                        }}
                      />
                    ) : (
                      <div 
                        className="border-2 border-dashed flex items-center justify-center text-center"
                        style={{ 
                          width: '140px', 
                          height: '88px',
                          borderColor: '#d1d5db',
                          fontSize: '11px',
                          color: '#9ca3af',
                          lineHeight: '14px'
                        }}
                      >
                        Insert company logo here
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="mb-8">
                <h1 className="font-bold" style={{ 
                  fontSize: '24px', 
                  color: '#1f2937',
                  fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
                  lineHeight: '1.2'
                }}>
                  Work Activities & Risk Assessment
                </h1>
              </div>

              {/* Work Activities Table */}
              <div className="mb-8">
                <table className="w-full border-collapse work-activities-table" style={{ fontSize: '11px', border: '1px solid #e5e7eb', fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2' }}>
                  <thead>
                    <tr>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '4%' }}>#</th>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '18%' }}>Activity</th>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '20%' }}>Hazards</th>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '10%' }}>Initial Risk</th>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '28%' }}>Control Measures</th>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '10%' }}>Residual Risk</th>
                      <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '10%' }}>Legislation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageActivities.map((activity, index) => (
                      <tr key={`activity-${pageIndex}-${activity.id}`}>
                        <td className="border p-2 align-top text-center font-semibold" style={{ borderColor: '#e5e7eb', color: '#111827' }}>
                          {pageIndex * 5 + index + 1}
                        </td>
                        <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                          {activity.activity}
                        </td>
                        <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                          <ul className="list-disc list-inside space-y-1">
                            {activity.hazards.map((hazard, hIndex) => (
                              <li key={`hazard-${pageIndex}-${activity.id}-${hIndex}`}>{hazard}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827', backgroundColor: '#ffffff' }}>
                          <div dangerouslySetInnerHTML={{
                            __html: getRiskBadgeHTML(
                              activity.initialRisk?.level || 'low',
                              activity.initialRisk?.score || 1
                            )
                          }} />
                        </td>
                        <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                          <ul className="list-disc list-inside space-y-1">
                            {activity.controlMeasures.map((measure, mIndex) => (
                              <li key={`measure-${pageIndex}-${activity.id}-${mIndex}`}>{measure}</li>
                            ))}
                          </ul>
                        </td>
                        <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827', backgroundColor: '#ffffff' }}>
                          <div dangerouslySetInnerHTML={{
                            __html: getRiskBadgeHTML(
                              activity.residualRisk?.level || 'low',
                              activity.residualRisk?.score || 1
                            )
                          }} />
                        </td>
                        <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                          <ul className="list-disc list-inside space-y-1">
                            {activity.legislation.map((leg, lIndex) => (
                              <li key={`legislation-${pageIndex}-${activity.id}-${lIndex}`}>{leg}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
          );
        })}
      </div>
    );
  };

  const renderWorkActivitiesPageOld = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Work Activities & Risk Assessment
          </h1>
        </div>

        {/* Work Activities Table */}
        <div className="mb-8">
          <table className="w-full border-collapse work-activities-table" style={{ fontSize: '11px', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '3%' }}>#</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '14%' }}>Activity</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '23%' }}>Hazards</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '11%' }}>Initial Risk</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '27%' }}>Control Measures</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '11%' }}>Residual Risk</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '11%' }}>Legislation</th>
              </tr>
            </thead>
            <tbody>
              {formData.workActivities.map((activity, index) => (
                <tr key={activity.id}>
                  <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{index + 1}</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>{activity.activity}</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                    {activity.hazards?.join(', ') || 'No hazards specified'}
                  </td>
                  <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827' }}>
                    {((activity.initialRisk?.level || 'low').charAt(0).toUpperCase() + (activity.initialRisk?.level || 'low').slice(1))} ({activity.initialRisk?.score || 1})
                  </td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                    {activity.controlMeasures?.join(', ') || 'No control measures specified'}
                  </td>
                  <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827' }}>
                    {((activity.residualRisk?.level || 'low').charAt(0).toUpperCase() + (activity.residualRisk?.level || 'low').slice(1))} ({activity.residualRisk?.score || 1})
                  </td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', textAlign: 'left', paddingLeft: '12px' }}>
                    {activity.legislation?.join(', ') || 'No legislation specified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );

  const renderPPEPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Personal Protective Equipment (PPE)
          </h1>
        </div>

        {/* PPE Grid */}
        <div className="grid grid-cols-4 gap-4">
          {formData.ppeItems.map((ppe, index) => (
            <div 
              key={ppe.id}
              className={`border rounded p-4 text-center flex items-center justify-center ${
                ppe.selected 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-white border-gray-200'
              }`}
              style={{ 
                fontSize: '11px',
                color: ppe.selected ? '#16a34a' : '#111827',
                minHeight: '80px'
              }}
            >
              <div className="font-semibold">{ppe.name}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );

  const renderPlantEquipmentPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Plant & Equipment
          </h1>
        </div>

        {/* Plant & Equipment Table */}
        <div className="mb-8">
          <table className="w-full border-collapse plant-equipment-table" style={{ fontSize: '11px', border: '1px solid #e5e7eb', fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2' }}>
            <thead>
              <tr>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '25%' }}>Equipment</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '15%' }}>Model</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '20%' }}>Serial Number</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '15%' }}>Risk Level</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '15%' }}>Next Inspection</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb', width: '10%' }}>Certification</th>
              </tr>
            </thead>
            <tbody>
              {(formData.plantEquipment || []).map((equipment, index) => (
                <tr key={index}>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{equipment.equipment || 'Not specified'}</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{equipment.model || 'N/A'}</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{equipment.serialNumber || 'N/A'}</td>
                  <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827' }}>
                    {equipment.riskLevel ? equipment.riskLevel.charAt(0).toUpperCase() + equipment.riskLevel.slice(1).toLowerCase() : 'Low'}
                  </td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{equipment.nextInspection || 'N/A'}</td>
                  <td className="border p-2 align-top text-center" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{equipment.certificationRequired ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );



  const renderSignInPages = () => {
    const signInPages = chunkSignInIntoPages();
    
    // For PDF generation, show only the current page index
    // For live preview, show all pages
    const pagesToShow = signInPages.slice(currentSignInPageIndex, currentSignInPageIndex + 1);
    
    return (
      <div className="space-y-8">
        {pagesToShow.map((pageEntries, relativeIndex) => {
          const pageIndex = currentSignInPageIndex + relativeIndex;
          return (
            <div key={pageIndex} className="bg-white shadow-lg mx-auto print-page relative page-break" style={{ width: '1123px', minHeight: '794px' }}>
              {/* Watermark */}
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-center">
                      <div 
                        className="text-gray-200 font-bold select-none opacity-30"
                        style={{ 
                          fontSize: '20px',
                          transform: 'rotate(-45deg)',
                          whiteSpace: 'nowrap',
                          lineHeight: '24px',
                          textAlign: 'center'
                        }}
                      >
                        <div>{formData.companyName}</div>
                        <div>{formData.projectName}</div>
                        <div>{formData.projectNumber}</div>
                        <div>{formData.projectAddress}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
                {/* Header Section */}
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={riskifyLogo} 
                      alt="Riskify Logo" 
                      style={{ height: '86px', width: 'auto' }}
                    />
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: '#1f2937',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      lineHeight: '1.2'
                    }}>
                      Safe Work Method Statement
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-right" style={{ 
                      fontSize: '13px', 
                      lineHeight: '18px',
                      color: '#6b7280',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      lineHeight: '1.2'
                    }}>
                      <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
                      <div>{formData.projectName}</div>
                      <div>{formData.projectNumber}</div>
                      <div>{formData.projectAddress}</div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {formData.companyLogo ? (
                        <img 
                          src={formData.companyLogo} 
                          alt="Company Logo" 
                          style={{ 
                            height: '86px', 
                            width: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                      ) : (
                        <div 
                          className="border-2 border-dashed flex items-center justify-center text-center"
                          style={{ 
                            height: '86px', 
                            width: '120px',
                            borderColor: '#d1d5db',
                            fontSize: '11px',
                            color: '#9ca3af',
                            lineHeight: '14px'
                          }}
                        >
                          Company Logo
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Title */}
                <div className="mb-8">
                  <h1 className="font-bold" style={{ 
                    fontSize: '24px', 
                    color: '#1f2937',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    lineHeight: '1.2'
                  }}>
                    Sign In Register
                  </h1>
                </div>

                {/* Sign In Table */}
                <div className="mb-8">
                  <table className="w-full border-collapse" style={{ fontSize: '11px', border: '1px solid #e5e7eb' }}>
                    <thead>
                      <tr>
                        <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Name</th>
                        <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Number</th>
                        <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Signature</th>
                        <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageEntries.map((entry, i) => (
                        <tr key={i}>
                          <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px', backgroundColor: '#ffffff' }}>
                            {entry.name || '\u00A0'}
                          </td>
                          <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px', backgroundColor: '#ffffff' }}>
                            {entry.number || '\u00A0'}
                          </td>
                          <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px', backgroundColor: '#ffffff' }}>
                            {entry.signature || '\u00A0'}
                          </td>
                          <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px', backgroundColor: '#ffffff' }}>
                            {entry.date || '\u00A0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSignInPage = () => (
    <div className="bg-white shadow-lg mx-auto print-page relative" style={{ width: '1123px', minHeight: '794px' }}>
      {/* Watermark */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-center">
              <div 
                className="text-gray-200 font-bold select-none opacity-30"
                style={{ 
                  fontSize: '20px',
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  lineHeight: '24px',
                  textAlign: 'center'
                }}
              >
                <div>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '48px 40px', position: 'relative', zIndex: 1 }}>
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div className="flex items-center space-x-4">
            <img 
              src={riskifyLogo} 
              alt="Riskify Logo" 
              style={{ height: '86px', width: 'auto' }}
            />
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              Safe Work Method Statement
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="text-right" style={{ 
              fontSize: '13px', 
              lineHeight: '18px',
              color: '#6b7280',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2'
            }}>
              <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
              <div>{formData.projectName}</div>
              <div>{formData.projectNumber}</div>
              <div>{formData.projectAddress}</div>
            </div>
            
            <div className="flex-shrink-0">
              {formData.companyLogo ? (
                <img 
                  src={formData.companyLogo} 
                  alt="Company Logo" 
                  style={{ 
                    height: '86px', 
                    width: 'auto',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <div 
                  className="border-2 border-dashed flex items-center justify-center text-center"
                  style={{ 
                    height: '86px', 
                    width: '120px',
                    borderColor: '#d1d5db',
                    fontSize: '11px',
                    color: '#9ca3af',
                    lineHeight: '14px'
                  }}
                >
                  Company Logo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="mb-8">
          <h1 className="font-bold" style={{ 
            fontSize: '24px', 
            color: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: '1.2',
            lineHeight: '1.2'
          }}>
            Sign In Register
          </h1>
        </div>

        {/* Sign In Table */}
        <div className="mb-8">
          <table className="w-full border-collapse" style={{ fontSize: '11px', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Name</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Number</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Signature</th>
                <th className="border p-2 text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: '#1f2937', borderColor: '#e5e7eb' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => (
                <tr key={i}>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px' }}>&nbsp;</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px' }}>&nbsp;</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px' }}>&nbsp;</td>
                  <td className="border p-2 align-top" style={{ borderColor: '#e5e7eb', color: '#111827', height: '24px' }}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );

  const renderMSDSPage = () => {
    const selectedDocuments = formData.msdsDocuments.filter(doc => doc.selected);
    
    return (
      <div className="bg-white shadow-lg mx-auto print-page relative page-break" style={{ width: '1123px', minHeight: '794px' }}>
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="grid grid-cols-3 grid-rows-2 h-full w-full gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center">
                <div 
                  className="text-gray-200 font-bold select-none opacity-30"
                  style={{ 
                    fontSize: '20px',
                    transform: 'rotate(-45deg)',
                    whiteSpace: 'nowrap',
                    lineHeight: '24px',
                    textAlign: 'center'
                  }}
                >
                  <div>{formData.companyName}</div>
                  <div>RISKIFY</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 page-content">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div className="flex items-center space-x-4">
              <img 
                src={riskifyLogo} 
                alt="Riskify Logo" 
                style={{ height: '86px', width: 'auto' }}
              />
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#1f2937',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2'
              }}>
                Material Safety Data Sheets
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="text-right" style={{ 
                fontSize: '13px', 
                lineHeight: '18px',
                color: '#6b7280',
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: '1.2'
              }}>
                <div className="font-medium" style={{ color: '#374151' }}>{formData.companyName}</div>
                <div>{formData.projectName}</div>
                <div>{formData.projectNumber}</div>
                <div>{formData.projectAddress}</div>
              </div>
              
              <div className="flex-shrink-0">
                {formData.companyLogo ? (
                  <img 
                    src={formData.companyLogo} 
                    alt="Company Logo" 
                    style={{ 
                      height: '86px', 
                      width: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div 
                    className="border-2 border-dashed flex items-center justify-center text-center"
                    style={{ 
                      height: '86px', 
                      width: '120px',
                      borderColor: '#d1d5db',
                      fontSize: '11px',
                      color: '#9ca3af',
                      lineHeight: '14px'
                    }}
                  >
                    Company Logo
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MSDS Documents List */}
          <div className="space-y-6">
            {selectedDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No MSDS Documents Selected</div>
                <div className="text-gray-400 text-sm">
                  Use the form on the left to upload and select MSDS documents to include in your SWMS.
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1f2937' }}>
                    Attached Documents ({selectedDocuments.length})
                  </h2>

                </div>

                {/* Document List */}
                <div className="space-y-4">
                  {selectedDocuments.map((doc, index) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2" style={{ color: '#1f2937' }}>
                            {index + 1}. {doc.customTitle || doc.fileName}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Original File:</strong> {doc.fileName}</div>
                            <div><strong>Upload Date:</strong> {new Date(doc.uploadDate).toLocaleDateString()}</div>
                            <div><strong>File Type:</strong> PDF Document</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            Attached
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Note */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="text-yellow-600 mr-3">⚠️</div>
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">Important Note</h4>
                        <p className="text-sm text-yellow-700">
                          Please ensure all personnel review the attached MSDS documents before commencing work. 
                          These documents contain critical safety information about hazardous materials that may 
                          be encountered during the project.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'project-info':
        return renderProjectInfoPage();
      case 'emergency-info':
        return renderEmergencyInfoPage();
      case 'high-risk-activities':
        return renderHighRiskActivitiesPage();
      case 'risk-matrix':
        return renderRiskMatrixPage();
      case 'work-activities':
        return renderWorkActivitiesPages();
      case 'ppe':
        return renderPPEPage();
      case 'plant-equipment':
        return renderPlantEquipmentPage();
      case 'sign-in':
        return renderSignInPages();
      case 'msds':
        return renderMSDSPage();
      default:
        return renderProjectInfoPage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Form Panel */}
      <div className="w-1/3 bg-white p-8 overflow-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">SWMS Generator</h1>
        
        {/* Page Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCurrentPage('project-info')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'project-info' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Project Info
            </button>
            <button
              onClick={() => setCurrentPage('emergency-info')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'emergency-info' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Emergency Info
            </button>
            <button
              onClick={() => setCurrentPage('high-risk-activities')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'high-risk-activities' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              High Risk Activities
            </button>
            <button
              onClick={() => setCurrentPage('risk-matrix')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'risk-matrix' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Risk Matrix
            </button>
            <button
              onClick={() => setCurrentPage('work-activities')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'work-activities' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Work Activities
            </button>
            <button
              onClick={() => setCurrentPage('ppe')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'ppe' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              PPE
            </button>
            <button
              onClick={() => setCurrentPage('plant-equipment')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'plant-equipment' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Plant & Equipment
            </button>
            <button
              onClick={() => setCurrentPage('sign-in')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'sign-in' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign In Register
            </button>
            <button
              onClick={() => setCurrentPage('msds')}
              className={`px-3 py-2 text-xs font-medium rounded ${
                currentPage === 'msds' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              MSDS
            </button>
          
          <div className="ml-auto flex space-x-2">
            <button
              onClick={handlePrintAllPages}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              title="Print all 8 pages in sequence"
            >
              Print PDF
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={exportVectorPdf}
              className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              title="Export vector PDF with selectable text and small file size"
            >
              Vector PDF
            </button>
            <button
              onClick={exportPuppeteerPdf}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              title="Export pixel-perfect PDF using Puppeteer (Chrome headless)"
            >
              Pixel PDF
            </button>
          </div>
          </div>
        </div>
        
        {/* Form inputs for the current page */}
        {currentPage === 'project-info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Project Information</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const result = event.target?.result as string;
                      setFormData({ ...formData, companyLogo: result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
              {formData.companyLogo && (
                <div className="mt-2">
                  <img 
                    src={formData.companyLogo} 
                    alt="Company Logo Preview" 
                    className="h-20 w-auto border border-gray-300 rounded"
                  />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
              <input
                type="text"
                value={formData.projectNumber}
                onChange={(e) => setFormData({ ...formData, projectNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Address</label>
              <input
                type="text"
                value={formData.projectAddress}
                onChange={(e) => setFormData({ ...formData, projectAddress: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Name</label>
              <input
                type="text"
                value={formData.jobName}
                onChange={(e) => setFormData({ ...formData, jobName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Number</label>
              <input
                type="text"
                value={formData.jobNumber}
                onChange={(e) => setFormData({ ...formData, jobNumber: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
              <input
                type="text"
                value={formData.dateCreated}
                onChange={(e) => setFormData({ ...formData, dateCreated: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal Contractor</label>
              <input
                type="text"
                value={formData.principalContractor}
                onChange={(e) => setFormData({ ...formData, principalContractor: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
              <input
                type="text"
                value={formData.projectManager}
                onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Supervisor</label>
              <input
                type="text"
                value={formData.siteSupervisor}
                onChange={(e) => setFormData({ ...formData, siteSupervisor: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorising Person Name</label>
              <input
                type="text"
                value={formData.authorisingPerson}
                onChange={(e) => setFormData({ ...formData, authorisingPerson: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorising Person Position</label>
              <input
                type="text"
                value={formData.authorisingPosition}
                onChange={(e) => setFormData({ ...formData, authorisingPosition: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Authorising Person Signature</label>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Upload Signature Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result as string;
                          setFormData({ ...formData, authorisingSignature: result, authorisingSignatureName: '' });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                
                <div className="text-center text-xs text-gray-500">OR</div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type Signature</label>
                  <input
                    type="text"
                    value={formData.authorisingSignatureName || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      authorisingSignatureName: e.target.value,
                      authorisingSignature: e.target.value ? '' : formData.authorisingSignature
                    })}
                    placeholder="Type signature here..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ fontFamily: 'Dancing Script, cursive', fontSize: '18px' }}
                  />
                </div>
              </div>
              
              {(formData.authorisingSignature || formData.authorisingSignatureName) && (
                <div className="mt-2 p-2 border border-gray-300 rounded bg-gray-50">
                  <div className="text-xs text-gray-600 mb-1">Preview:</div>
                  {formData.authorisingSignature ? (
                    <img 
                      src={formData.authorisingSignature} 
                      alt="Authorising Person Signature Preview" 
                      className="h-16 w-auto border border-gray-300 rounded bg-white"
                    />
                  ) : (
                    <div 
                      className="h-16 flex items-center px-3 bg-white border border-gray-300 rounded"
                      style={{ 
                        fontFamily: 'Dancing Script, cursive', 
                        fontSize: '24px',
                        color: '#1f2937'
                      }}
                    >
                      {formData.authorisingSignatureName}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Scope of Works Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Scope of Works</h3>
              <textarea
                value={formData.scopeOfWorks}
                onChange={(e) => setFormData({ ...formData, scopeOfWorks: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter the scope of works description..."
              />
            </div>
            
            {/* Review and Monitoring Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Review and Monitoring</h3>
              <textarea
                value={formData.reviewAndMonitoring}
                onChange={(e) => setFormData({ ...formData, reviewAndMonitoring: e.target.value })}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter review and monitoring requirements..."
              />
            </div>
          </div>
        )}

        {currentPage === 'emergency-info' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Emergency Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contacts</label>
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={contact.name}
                    onChange={(e) => {
                      const newContacts = [...formData.emergencyContacts];
                      newContacts[index].name = e.target.value;
                      setFormData({ ...formData, emergencyContacts: newContacts });
                    }}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={contact.phone}
                    onChange={(e) => {
                      const newContacts = [...formData.emergencyContacts];
                      newContacts[index].phone = e.target.value;
                      setFormData({ ...formData, emergencyContacts: newContacts });
                    }}
                    className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Procedures</label>
              <textarea
                value={formData.emergencyProcedures}
                onChange={(e) => setFormData({ ...formData, emergencyProcedures: e.target.value })}
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring & Review Requirements</label>
              <textarea
                value={formData.emergencyMonitoring}
                onChange={(e) => setFormData({ ...formData, emergencyMonitoring: e.target.value })}
                rows={6}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Describe monitoring requirements, review schedules, compliance checks..."
              />
            </div>
          </div>
        )}

        {currentPage === 'high-risk-activities' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">High Risk Activities</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select High Risk Activities</label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {formData.highRiskActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={activity.selected}
                    onChange={(e) => {
                      const newActivities = [...formData.highRiskActivities];
                      newActivities[index].selected = e.target.checked;
                      setFormData({ ...formData, highRiskActivities: newActivities });
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1 text-sm">{activity.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'ppe' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Personal Protective Equipment</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Required PPE</label>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {formData.ppeItems.map((ppe, index) => (
                <div key={ppe.id} className="flex items-start space-x-3 p-3 border rounded bg-gray-50">
                  <input
                    type="checkbox"
                    checked={ppe.selected}
                    onChange={(e) => {
                      const newPpe = [...formData.ppeItems];
                      newPpe[index].selected = e.target.checked;
                      setFormData({ ...formData, ppeItems: newPpe });
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{ppe.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{ppe.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const newPpe = {
                  id: Date.now().toString(),
                  name: 'New PPE Item',
                  description: 'Description',
                  category: 'General',
                  selected: false
                };
                setFormData({ ...formData, ppeItems: [...formData.ppeItems, newPpe] });
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Add PPE Item
            </button>
          </div>
        )}

        {currentPage === 'work-activities' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Work Activities Risk Assessment</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.workActivities.map((activity, index) => (
                <div key={activity.id} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                      <input
                        type="text"
                        value={activity.activity}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index] = {
                            ...newActivities[index],
                            activity: e.target.value
                          };
                          setFormData({ ...formData, workActivities: newActivities });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Risk Level</label>
                      <select
                        value={activity.initialRisk.level}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index] = {
                            ...newActivities[index],
                            initialRisk: {
                              ...newActivities[index].initialRisk,
                              level: e.target.value as any
                            }
                          };
                          setFormData({ ...formData, workActivities: newActivities });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="extreme">Extreme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Risk Score</label>
                      <input
                        type="number"
                        value={activity.initialRisk.score}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index] = {
                            ...newActivities[index],
                            initialRisk: {
                              ...newActivities[index].initialRisk,
                              score: parseInt(e.target.value) || 0
                            }
                          };
                          setFormData({ ...formData, workActivities: newActivities });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        min="1"
                        max="25"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hazards (comma separated)</label>
                    <input
                      type="text"
                      value={activity.hazards.join(', ')}
                      onChange={(e) => {
                        const newActivities = [...formData.workActivities];
                        newActivities[index] = {
                          ...newActivities[index],
                          hazards: e.target.value.split(', ').filter(h => h.trim())
                        };
                        setFormData({ ...formData, workActivities: newActivities });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Control Measures (comma separated)</label>
                    <input
                      type="text"
                      value={activity.controlMeasures.join(', ')}
                      onChange={(e) => {
                        const newActivities = [...formData.workActivities];
                        newActivities[index] = {
                          ...newActivities[index],
                          controlMeasures: e.target.value.split(', ').filter(m => m.trim())
                        };
                        setFormData({ ...formData, workActivities: newActivities });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residual Risk Level</label>
                      <select
                        value={activity.residualRisk.level}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index] = {
                            ...newActivities[index],
                            residualRisk: {
                              ...newActivities[index].residualRisk,
                              level: e.target.value as any
                            }
                          };
                          setFormData({ ...formData, workActivities: newActivities });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="extreme">Extreme</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residual Risk Score</label>
                      <input
                        type="number"
                        value={activity.residualRisk.score}
                        onChange={(e) => {
                          const newActivities = [...formData.workActivities];
                          newActivities[index] = {
                            ...newActivities[index],
                            residualRisk: {
                              ...newActivities[index].residualRisk,
                              score: parseInt(e.target.value) || 0
                            }
                          };
                          setFormData({ ...formData, workActivities: newActivities });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        min="1"
                        max="25"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Legislation (comma separated)</label>
                    <input
                      type="text"
                      value={activity.legislation.join(', ')}
                      onChange={(e) => {
                        const newActivities = [...formData.workActivities];
                        newActivities[index] = {
                          ...newActivities[index],
                          legislation: e.target.value.split(', ').filter(l => l.trim())
                        };
                        setFormData({ ...formData, workActivities: newActivities });
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., Work Health and Safety Act 2011, Construction Work Code of Practice"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newActivities = formData.workActivities.filter((_, i) => i !== index);
                      setFormData({ ...formData, workActivities: newActivities });
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Activity
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newActivity = {
                    id: Date.now().toString(),
                    activity: 'New Activity',
                    hazards: ['New hazard'],
                    initialRisk: { level: 'medium' as const, score: 10 },
                    controlMeasures: ['Control measure'],
                    residualRisk: { level: 'low' as const, score: 5 },
                    legislation: ['Relevant legislation']
                  };
                  setFormData({ ...formData, workActivities: [...formData.workActivities, newActivity] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
              >
                + Add New Activity
              </button>
            </div>
          </div>
        )}

        {currentPage === 'plant-equipment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Plant & Equipment Register</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {(formData.plantEquipment || []).map((equipment, index) => (
                <div key={equipment.id} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                      <input
                        type="text"
                        value={equipment.equipment}
                        onChange={(e) => {
                          const currentEquipment = formData.plantEquipment || [];
                          const newEquipment = [...currentEquipment];
                          newEquipment[index].equipment = e.target.value;
                          setFormData({ 
                            ...formData, 
                            plantEquipment: newEquipment
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input
                        type="text"
                        value={equipment.model || ''}
                        onChange={(e) => {
                          const currentEquipment = formData.plantEquipment || [];
                          const newEquipment = [...currentEquipment];
                          newEquipment[index].model = e.target.value;
                          setFormData({ 
                            ...formData, 
                            plantEquipment: newEquipment
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={equipment.serialNumber || ''}
                        onChange={(e) => {
                          const currentEquipment = formData.plantEquipment || [];
                          const newEquipment = [...currentEquipment];
                          newEquipment[index].serialNumber = e.target.value;
                          setFormData({ 
                            ...formData, 
                            plantEquipment: newEquipment
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                      <select
                        value={equipment.riskLevel || 'low'}
                        onChange={(e) => {
                          const currentEquipment = formData.plantEquipment || [];
                          const newEquipment = [...currentEquipment];
                          newEquipment[index].riskLevel = e.target.value as 'low' | 'medium' | 'high';
                          setFormData({ 
                            ...formData, 
                            plantEquipment: newEquipment
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Next Inspection</label>
                      <input
                        type="text"
                        value={equipment.nextInspection || ''}
                        onChange={(e) => {
                          const currentEquipment = formData.plantEquipment || [];
                          const newEquipment = [...currentEquipment];
                          newEquipment[index].nextInspection = e.target.value;
                          setFormData({ 
                            ...formData, 
                            plantEquipment: newEquipment
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certification Required</label>
                      <select
                        value={equipment.certificationRequired ? 'true' : 'false'}
                        onChange={(e) => {
                          const currentEquipment = formData.plantEquipment || [];
                          const newEquipment = [...currentEquipment];
                          newEquipment[index].certificationRequired = e.target.value === 'true';
                          setFormData({ 
                            ...formData, 
                            plantEquipment: newEquipment
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const currentEquipment = formData.plantEquipment || [];
                      const newEquipment = currentEquipment.filter((_, i) => i !== index);
                      setFormData({ 
                        ...formData, 
                        plantEquipment: newEquipment
                      });
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Equipment
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newEquipment = {
                    id: Date.now().toString(),
                    equipment: '',
                    model: '',
                    serialNumber: '',
                    riskLevel: 'low' as const,
                    nextInspection: '',
                    certificationRequired: false,
                    hazards: [],
                    initialRisk: { level: 'low' as const, score: 1 },
                    controlMeasures: [],
                    residualRisk: { level: 'low' as const, score: 1 },
                    legislation: []
                  };
                  const currentEquipment = formData.plantEquipment || [];
                  setFormData({ 
                    ...formData, 
                    plantEquipment: [...currentEquipment, newEquipment]
                  });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
              >
                + Add New Equipment
              </button>
            </div>
          </div>
        )}

        {currentPage === 'sign-in' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">Site Personnel Sign In Register</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {formData.signInEntries.map((entry, index) => (
                <div key={entry.id} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={entry.name}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].name = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
                      <input
                        type="text"
                        value={entry.number}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].number = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                      <input
                        type="text"
                        value={entry.signature}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].signature = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="text"
                        value={entry.date}
                        onChange={(e) => {
                          const newEntries = [...formData.signInEntries];
                          newEntries[index].date = e.target.value;
                          setFormData({ ...formData, signInEntries: newEntries });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newEntries = formData.signInEntries.filter((_, i) => i !== index);
                      setFormData({ ...formData, signInEntries: newEntries });
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remove Entry
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newEntry = {
                    id: Date.now().toString(),
                    name: '',
                    company: '',
                    position: '',
                    date: new Date().toLocaleDateString('en-AU'),
                    timeIn: '',
                    timeOut: '',
                    signature: '',
                    inductionComplete: false
                  };
                  setFormData({ ...formData, signInEntries: [...formData.signInEntries, newEntry] });
                }}
                className="w-full p-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-green-300 hover:text-green-600"
              >
                + Add New Sign In Entry
              </button>
            </div>
          </div>
        )}

        {currentPage === 'msds' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-4">MSDS Documents Library</h2>
            
            <div className="space-y-4">
              {formData.msdsDocuments.map((doc, index) => (
                <div key={doc.id} className="border border-gray-300 rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{doc.customTitle || doc.fileName}</h3>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={doc.selected}
                          onChange={(e) => {
                            const newDocs = [...formData.msdsDocuments];
                            newDocs[index].selected = e.target.checked;
                            setFormData({ ...formData, msdsDocuments: newDocs });
                          }}
                          className="mr-2"
                        />
                        Include in SWMS
                      </label>
                      <button
                        onClick={() => {
                          const newDocs = formData.msdsDocuments.filter((_, i) => i !== index);
                          setFormData({ ...formData, msdsDocuments: newDocs });
                        }}
                        className="text-red-600 text-sm hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                      <input
                        type="text"
                        value={doc.customTitle}
                        onChange={(e) => {
                          const newDocs = [...formData.msdsDocuments];
                          newDocs[index].customTitle = e.target.value;
                          setFormData({ ...formData, msdsDocuments: newDocs });
                        }}
                        placeholder="Enter custom document title"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Original File Name</label>
                      <input
                        type="text"
                        value={doc.fileName}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64Data = event.target?.result as string;
                        const newDoc = {
                          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                          fileName: file.name,
                          customTitle: file.name.replace('.pdf', ''),
                          fileData: base64Data,
                          uploadDate: new Date().toISOString(),
                          selected: false
                        };
                        setFormData({ 
                          ...formData, 
                          msdsDocuments: [...formData.msdsDocuments, newDoc] 
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                    // Clear the input
                    e.target.value = '';
                  }}
                  className="hidden"
                  id="msds-upload"
                />
                <label 
                  htmlFor="msds-upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Upload MSDS Documents (PDF)
                </label>
                <p className="mt-2 text-sm text-gray-500">
                  Upload one or more PDF files to add to your MSDS library
                </p>
              </div>
              
              {formData.msdsDocuments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Selected for SWMS:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    {formData.msdsDocuments
                      .filter(doc => doc.selected)
                      .map(doc => (
                        <li key={doc.id}>• {doc.customTitle || doc.fileName}</li>
                      ))}
                  </ul>
                  {formData.msdsDocuments.filter(doc => doc.selected).length === 0 && (
                    <p className="text-sm text-blue-600">No documents selected for inclusion in SWMS</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'risk-matrix' && (
          <div className="text-gray-600">
            <h2 className="text-lg font-semibold mb-4">Risk Matrix</h2>
            <p>Form controls for editing risk matrix data will be implemented based on user feedback.</p>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      <div className="w-2/3 overflow-auto" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="p-6">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
}