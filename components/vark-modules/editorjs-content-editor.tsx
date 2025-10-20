'use client';

import React, { useEffect, useRef, memo, useCallback } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Checklist from '@editorjs/checklist';
import Table from '@editorjs/table';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';
import ImageTool from '@editorjs/image';
import { uploadImageByFile, uploadImageByUrl } from '@/lib/utils/image-upload';

// @ts-expect-error - Embed tool has module resolution issues but works at runtime
import EmbedTool from '@editorjs/embed';

import EditorjsLayout from 'editorjs-layout';

interface EditorJSContentEditorProps {
  data?: OutputData;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const EditorJSContentEditor: React.FC<EditorJSContentEditorProps> = memo(
  ({
    data,
    onChange,
    placeholder = 'Start writing your content...',
    readOnly = false
  }) => {
    const editorRef = useRef<EditorJS | null>(null);
    const holderRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!holderRef.current) return;

      // ⭐ Log what data prop we received
      console.log('🎯 EditorJS Component Received Data:', {
        hasData: !!data,
        dataType: typeof data,
        hasBlocks: !!data?.blocks,
        blocksCount: data?.blocks?.length || 0,
        rawData: data
      });

      // Debug: Check if tools are loaded
      console.log('🔍 Editor.js Tools Check:', {
        ImageTool: !!ImageTool,
        EmbedTool: !!EmbedTool,
        LayoutTool: !!EditorjsLayout,
        'Embed = Videos': !!EmbedTool
      });

      // Prepare tools configuration - ALL TOOLS IN ONE PLACE
      const tools: any = {
        // ============ TEXT BLOCKS ============
        header: {
          class: Header,
          config: {
            placeholder: 'Enter a heading',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          },
          inlineToolbar: true
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
          config: {
            placeholder: 'Start typing...'
          }
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: "Quote's author"
          }
        },
        code: {
          class: Code,
          config: {
            placeholder: 'Enter code here...'
          }
        },

        // ============ LIST BLOCKS ============
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        },

        // ============ MEDIA BLOCKS ============
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile(file: File) {
                return uploadImageByFile(file);
              },
              uploadByUrl(url: string) {
                return uploadImageByUrl(url);
              }
            },
            captionPlaceholder: 'Enter image caption (optional)'
          },
          inlineToolbar: true,
          toolbox: {
            title: 'Image',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150.242V79c0-18.778-15.222-34-34-34H79c-18.778 0-34 15.222-34 34v42.264l67.179-44.192 80.398 71.614 56.686-29.14L291 150.242zm-.345 51.622l-42.3-30.246-56.3 29.884-80.773-66.925L45 174.187V197c0 18.778 15.222 34 34 34h178c17.126 0 31.295-12.663 33.655-29.136zM79 0h178c43.63 0 79 35.37 79 79v118c0 43.63-35.37 79-79 79H79c-43.63 0-79-35.37-79-79V79C0 35.37 35.37 0 79 0z"/></svg>'
          }
        },
        ...(EmbedTool && {
          embed: {
            class: EmbedTool,
            config: {
              services: {
                // Video platforms
                youtube: true,
                vimeo: true,
                facebook: true,
                instagram: true,
                twitter: true,
                twitch: true,

                // Audio platforms
                soundcloud: true,

                // Other embeds
                miro: true,
                codepen: true,
                imgur: true
              }
            },
            inlineToolbar: true,
            toolbox: {
              title: 'Video/Audio',
              icon: '<svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>'
            }
          }
        }),

        // ============ STRUCTURED BLOCKS ============
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          },
          toolbox: {
            title: 'Table',
            icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 0h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-14A1.5 1.5 0 0 1 0 13.5v-12A1.5 1.5 0 0 1 1.5 0zM1 1.5v3.75h3.5V1.5H1zm4.5 0v3.75h6V1.5h-6zm7 0v3.75H16V1.5h-3.5zM1 6.25v3.5h3.5v-3.5H1zm4.5 0v3.5h6v-3.5h-6zm7 0v3.5H16v-3.5h-3.5zM1 10.75v2.75h3.5v-2.75H1zm4.5 0v2.75h6v-2.75h-6zm7 0v2.75H16v-2.75h-3.5z"/></svg>'
          }
        },
        warning: {
          class: Warning,
          inlineToolbar: true,
          config: {
            titlePlaceholder: 'Title',
            messagePlaceholder: 'Message'
          },
          toolbox: {
            title: 'Warning',
            icon: '<svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 0C3.806 0 0 3.806 0 8.5S3.806 17 8.5 17 17 13.194 17 8.5 13.194 0 8.5 0zm0 1.5c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7zM8.5 4C7.672 4 7 4.672 7 5.5S7.672 7 8.5 7 10 6.328 10 5.5 9.328 4 8.5 4zm0 4a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 1 0v-4a.5.5 0 0 0-.5-.5z"/></svg>'
          }
        },

        // ============ SPECIAL BLOCKS ============
        delimiter: {
          class: Delimiter,
          toolbox: {
            title: 'Delimiter',
            icon: '<svg width="17" height="17" viewBox="0 0 17 17" xmlns="http://www.w3.org/2000/svg"><line x1="1" y1="8.5" x2="16" y2="8.5" stroke="currentColor" stroke-width="2"/></svg>'
          }
        },
        ...(EditorjsLayout && {
          layout: {
            class: EditorjsLayout,
            config: {
              EditorJS: EditorJS,
              enableLayoutEditing: true,
              enableLayoutSaving: true,
              initialData: {
                itemContent: {
                  1: {
                    blocks: []
                  }
                },
                layout: {
                  type: 'container',
                  id: '',
                  className: ''
                }
              }
            },
            shortcut: 'CMD+L',
            toolbox: {
              title: 'Layout',
              icon: '<svg width="17" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" fill="currentColor"/></svg>'
            }
          }
        }),

        // ============ INLINE TOOLS ============
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C'
        }
      };

      // Log which tools were successfully loaded
      console.log('✅ Editor.js tools loaded:', {
        'Text Blocks': '4 → header, paragraph, quote, code',
        'List Blocks': '2 → list, checklist',
        'Media Blocks': `${tools.image ? 1 : 0} image + ${
          tools.embed ? 1 : 0
        } embed (videos)`,
        Structured: '2 → table, warning',
        Special: `${1 + (tools.layout ? 1 : 0)} → delimiter${
          tools.layout ? ', layout' : ''
        }`,
        'Inline Tools': '2 → marker, inlineCode',
        '📊 Total Available': Object.keys(tools).length
      });

      // Debug: Show all tool names
      console.log('🔧 All tool names:', Object.keys(tools));

      // Debug: Check if embed has toolbox
      if (tools.embed) {
        console.log('🎥 Embed tool config:', {
          hasClass: !!tools.embed.class,
          hasToolbox: !!tools.embed.toolbox,
          toolboxTitle: tools.embed.toolbox?.title
        });
      } else {
        console.warn('❌ Embed tool NOT in tools object!');
      }

      // ⭐ Validate and fix block data before passing to Editor.js
      // Don't add IDs - let Editor.js generate them
      const validatedData = data || {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      };

      // Ensure all blocks have required data structure (but don't add IDs)
      if (validatedData.blocks) {
        validatedData.blocks = validatedData.blocks.map((block: any) => {
          // Create a new block object to avoid mutation
          const newBlock = { ...block };
          
          // Ensure paragraph blocks have data.text
          if (newBlock.type === 'paragraph' && (!newBlock.data || typeof newBlock.data.text === 'undefined')) {
            newBlock.data = { text: '' };
          }
          
          return newBlock;
        });
      }

      console.log('📋 Validated data before Editor.js init:', {
        hasBlocks: !!validatedData.blocks,
        blockCount: validatedData.blocks?.length || 0,
        blocks: validatedData.blocks,
        // ⭐ Show EXACT structure of first block
        firstBlockStructure: validatedData.blocks?.[0] ? {
          id: validatedData.blocks[0].id || 'will-be-generated',
          type: validatedData.blocks[0].type,
          data: validatedData.blocks[0].data,
          hasType: !!validatedData.blocks[0].type,
          hasData: !!validatedData.blocks[0].data,
          dataKeys: validatedData.blocks[0].data ? Object.keys(validatedData.blocks[0].data) : [],
          dataText: validatedData.blocks[0].data?.text
        } : null
      });

      // Initialize Editor.js
      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder,
        readOnly,
        data: validatedData,
        tools,
        onChange: async () => {
          if (editorRef.current && !readOnly) {
            try {
              console.log('🔔 onChange triggered - waiting to save...');
              
              // ⭐ Shorter delay - 150ms should be enough
              await new Promise(resolve => setTimeout(resolve, 150));

              console.log('💿 Calling editorRef.current.save()...');
              const outputData = await editorRef.current.save();
              console.log('✅ Save completed, outputData:', outputData);
              
              console.log('📝 Editor.js onChange - saved data:', {
                blocksCount: outputData.blocks?.length || 0,
                blocks: outputData.blocks,
                hasContent: outputData.blocks?.some(b => b.data?.text) || false,
                // ⭐ Show actual text content
                textContent: outputData.blocks?.map(b => b.data?.text || '(empty)').join(' | '),
                blockStructure: outputData.blocks?.map(b => ({
                  id: b.id || 'no-id',
                  type: b.type,
                  hasData: !!b.data,
                  text: b.data?.text?.substring(0, 50) || '(empty)'
                }))
              });
              onChange(outputData);
            } catch (error) {
              console.error('❌ Error saving editor data:', error);
            }
          }
        },
        onReady: () => {
          console.log('✅ Editor.js is ready!', {
            initialBlocks: data?.blocks?.length || 0,
            initialData: data,
            // ⭐ Show exact block structure
            blockDetails: data?.blocks?.map(block => ({
              type: block.type,
              id: block.id,
              data: block.data,
              hasAllFields: !!(block.type && block.data)
            }))
          });
        }
      });

      editorRef.current = editor;

      // Cleanup function
      return () => {
        console.log('🧹 Cleaning up Editor.js instance');
        if (
          editorRef.current &&
          typeof editorRef.current.destroy === 'function'
        ) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, []); // ⭐ Empty deps - rely on key prop to force remount when switching sections

    return (
      <div className="border border-gray-300 rounded-lg bg-white">
        <div
          ref={holderRef}
          className="min-h-[300px] p-4 prose prose-sm max-w-none"
          style={{
            fontSize: '15px',
            lineHeight: '1.6'
          }}
        />
      </div>
    );
  }
);

EditorJSContentEditor.displayName = 'EditorJSContentEditor';

export default EditorJSContentEditor;
