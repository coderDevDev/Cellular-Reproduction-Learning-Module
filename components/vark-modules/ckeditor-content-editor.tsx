'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Heading,
  List,
  Link,
  BlockQuote,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Table,
  TableToolbar,
  MediaEmbed,
  Indent,
  IndentBlock,
  CodeBlock,
  HorizontalLine,
  Underline,
  Strikethrough,
  Code,
  Subscript,
  Superscript,
  Highlight,
  RemoveFormat,
  Undo,
  Font,
  Alignment,
  AutoLink,
  Base64UploadAdapter,
  PasteFromOffice,
  GeneralHtmlSupport,
  SourceEditing
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

interface CKEditorContentEditorProps {
  data: string;
  onChange: (data: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const CKEditorContentEditor: React.FC<CKEditorContentEditorProps> = ({
  data,
  onChange,
  placeholder = 'Start writing your content...',
  readOnly = false
}) => {
  const editorRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🎯 CKEditor Component Mounted:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    dataPreview: data?.substring(0, 100) || '(empty)',
    readOnly
  });

  // Debounced onChange handler to prevent excessive re-renders
  const debouncedOnChange = useCallback((content: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      console.log('📝 CKEditor debounced onChange:', {
        contentLength: content.length,
        hasContent: content.length > 0,
        preview: content.substring(0, 100)
      });
      onChange(content);
    }, 300); // 300ms debounce
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: 'GPL', // Use GPL license for open-source projects
          plugins: [
            Essentials,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Code,
            Subscript,
            Superscript,
            Paragraph,
            Heading,
            List,
            Link,
            AutoLink,
            BlockQuote,
            Image,
            ImageCaption,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            Base64UploadAdapter,
            Table,
            TableToolbar,
            MediaEmbed,
            Indent,
            IndentBlock,
            CodeBlock,
            HorizontalLine,
            Highlight,
            RemoveFormat,
            Undo,
            Font,
            Alignment,
            PasteFromOffice,
            GeneralHtmlSupport,
            SourceEditing
          ],
          toolbar: {
            items: [
              'undo',
              'redo',
              '|',
              'heading',
              '|',
              'fontSize',
              'fontFamily',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              '|',
              'alignment',
              '|',
              'numberedList',
              'bulletedList',
              '|',
              'outdent',
              'indent',
              '|',
              'link',
              'uploadImage',
              'insertTable',
              'mediaEmbed',
              '|',
              'blockQuote',
              'codeBlock',
              'horizontalLine',
              '|',
              'highlight',
              'code',
              'subscript',
              'superscript',
              '|',
              'removeFormat',
              '|',
              'sourceEditing'
            ],
            shouldNotGroupWhenFull: true
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
            ]
          },
          image: {
            toolbar: [
              'imageStyle:inline',
              'imageStyle:wrapText',
              'imageStyle:breakText',
              '|',
              'imageStyle:alignLeft',
              'imageStyle:alignCenter',
              'imageStyle:alignRight',
              '|',
              'toggleImageCaption',
              'imageTextAlternative',
              '|',
              'resizeImage'
            ],
            styles: {
              options: [
                'inline',
                'alignLeft',
                'alignCenter',
                'alignRight',
                'block',
                'side',
                {
                  name: 'wrapText',
                  title: 'Wrap text (Left)',
                  icon: 'left',
                  className: 'image-style-wrap-left',
                  modelElements: ['imageBlock', 'imageInline']
                },
                {
                  name: 'breakText',
                  title: 'Break text (Center)',
                  icon: 'center',
                  className: 'image-style-break-text',
                  modelElements: ['imageBlock']
                }
              ]
            },
            resizeOptions: [
              {
                name: 'resizeImage:original',
                label: 'Original',
                value: null
              },
              {
                name: 'resizeImage:25',
                label: '25%',
                value: '25'
              },
              {
                name: 'resizeImage:50',
                label: '50%',
                value: '50'
              },
              {
                name: 'resizeImage:75',
                label: '75%',
                value: '75'
              }
            ]
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
          },
          // Enable HTML support for pasted content from Word/Google Docs
          // PasteFromOffice plugin will clean up most Word styles automatically
          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: {
                  // Allow essential formatting styles
                  'text-align': true,
                  'background-color': true,
                  'color': true,
                  'border': true,
                  'border-collapse': true,
                  'padding': true,
                  'margin': true,
                  'width': true,
                  'height': true,
                  'vertical-align': true,
                  // Table specific
                  'border-spacing': true,
                  // List specific
                  'list-style-type': true,
                  // Position for responsive iframes
                  'position': true,
                  'padding-bottom': true,
                  'overflow': true,
                  'max-width': true,
                  'top': true,
                  'left': true
                }
              },
              {
                name: 'iframe',
                attributes: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'style']
              },
              {
                name: 'div',
                attributes: true,
                classes: true,
                styles: true
              }
            ]
          },
          placeholder: placeholder,
          link: {
            defaultProtocol: 'https://',
            decorators: {
              openInNewTab: {
                mode: 'manual',
                label: 'Open in a new tab',
                attributes: {
                  target: '_blank',
                  rel: 'noopener noreferrer'
                }
              }
            }
          },
          mediaEmbed: {
            previewsInData: true,
            providers: [
              {
                name: 'youtube',
                url: [
                  /^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)/,
                  /^(?:m\.)?youtube\.com\/v\/([\w-]+)/,
                  /^youtube\.com\/embed\/([\w-]+)/,
                  /^youtu\.be\/([\w-]+)/
                ],
                html: (match: string[]) => {
                  const id = match[1];
                  return (
                    '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">' +
                    `<iframe src="https://www.youtube.com/embed/${id}" ` +
                    'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                    'frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
                    'allowfullscreen></iframe>' +
                    '</div>'
                  );
                }
              },
              {
                name: 'vimeo',
                url: /^vimeo\.com\/(\d+)/,
                html: (match: string[]) => {
                  const id = match[1];
                  return (
                    '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">' +
                    `<iframe src="https://player.vimeo.com/video/${id}" ` +
                    'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                    'frameborder="0" allow="autoplay; fullscreen; picture-in-picture" ' +
                    'allowfullscreen></iframe>' +
                    '</div>'
                  );
                }
              },
              {
                name: 'dailymotion',
                url: [
                  /^(?:www\.)?dailymotion\.com\/video\/([\w-]+)/,
                  /^dai\.ly\/([\w-]+)/
                ],
                html: (match: string[]) => {
                  const id = match[1];
                  return (
                    '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">' +
                    `<iframe src="https://www.dailymotion.com/embed/video/${id}" ` +
                    'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                    'frameborder="0" allow="autoplay; fullscreen; picture-in-picture; web-share" ' +
                    'allowfullscreen></iframe>' +
                    '</div>'
                  );
                }
              },
              {
                name: 'googledrive',
                url: [
                  /^(?:https?:\/\/)?drive\.google\.com\/file\/d\/([\w-]+)/,
                  /^(?:https?:\/\/)?drive\.google\.com\/open\?id=([\w-]+)/
                ],
                html: (match: string[]) => {
                  const id = match[1];
                  return (
                    '<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;">' +
                    `<iframe src="https://drive.google.com/file/d/${id}/preview" ` +
                    'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" ' +
                    'frameborder="0" allow="autoplay" ' +
                    'allowfullscreen></iframe>' +
                    '</div>'
                  );
                }
              }
            ]
          }
        }}
        data={data || ''}
        disabled={readOnly}
        onReady={(editor) => {
          editorRef.current = editor;
          console.log('✅ CKEditor is ready!');
        }}
        onChange={(event, editor) => {
          const content = editor.getData();
          debouncedOnChange(content);
        }}
        onBlur={(event, editor) => {
          // Save immediately on blur to ensure content is not lost
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            const content = editor.getData();
            console.log('💾 CKEditor onBlur - immediate save');
            onChange(content);
          }
        }}
        onFocus={(event, editor) => {
          console.log('🎯 CKEditor focused');
        }}
      />
    </div>
  );
};

export default CKEditorContentEditor;
