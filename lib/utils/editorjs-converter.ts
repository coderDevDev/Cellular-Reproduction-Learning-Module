import { OutputData } from '@editorjs/editorjs';

/**
 * Convert Editor.js JSON output to plain text
 * Useful for previews and search
 */
export function editorJsToPlainText(data: OutputData): string {
  if (!data || !data.blocks) return '';

  return data.blocks
    .map(block => {
      switch (block.type) {
        case 'header':
          return block.data.text;
        case 'paragraph':
          return block.data.text;
        case 'list':
          return block.data.items.join('\n');
        case 'checklist':
          return block.data.items.map((item: any) => item.text).join('\n');
        case 'quote':
          return `"${block.data.text}" - ${block.data.caption}`;
        case 'code':
          return block.data.code;
        case 'warning':
          return `${block.data.title}: ${block.data.message}`;
        case 'table':
          return block.data.content.map((row: string[]) => row.join(' | ')).join('\n');
        case 'delimiter':
          return '---';
        case 'image':
          return block.data.caption || '[Image]';
        case 'video':
          return block.data.caption || '[Video]';
        case 'embed':
          return `[Embedded: ${block.data.service || 'content'}]`;
        case 'layout':
          // Extract text from layout items
          const layoutText = Object.values(block.data.itemContent || {})
            .map((item: any) => {
              if (item.blocks) {
                return item.blocks.map((b: any) => b.data?.text || '').join(' ');
              }
              return '';
            })
            .filter(Boolean)
            .join(' | ');
          return layoutText || '[Layout]';
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Convert Editor.js JSON to formatted HTML
 * For rendering in the module viewer
 */
export function editorJsToHtml(data: OutputData): string {
  if (!data || !data.blocks) return '';

  return data.blocks
    .map(block => {
      switch (block.type) {
        case 'header':
          const level = block.data.level || 2;
          return `<h${level} class="text-${4 - level}xl font-bold text-gray-900 mb-4">${block.data.text}</h${level}>`;
        
        case 'paragraph':
          return `<p class="text-gray-700 mb-4 leading-relaxed">${block.data.text}</p>`;
        
        case 'list':
          const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          const listClass = block.data.style === 'ordered' ? 'list-decimal' : 'list-disc';
          const items = block.data.items
            .map((item: string) => `<li class="ml-6 mb-2">${item}</li>`)
            .join('');
          return `<${listTag} class="${listClass} mb-4">${items}</${listTag}>`;
        
        case 'checklist':
          const checkItems = block.data.items
            .map((item: any) => {
              const checked = item.checked ? 'checked' : '';
              const checkIcon = item.checked ? '✅' : '⬜';
              return `<li class="flex items-center mb-2">
                <span class="mr-2">${checkIcon}</span>
                <span class="${item.checked ? 'line-through text-gray-500' : 'text-gray-700'}">${item.text}</span>
              </li>`;
            })
            .join('');
          return `<ul class="list-none mb-4">${checkItems}</ul>`;
        
        case 'quote':
          return `<blockquote class="border-l-4 border-teal-500 pl-4 py-2 mb-4 bg-teal-50 rounded-r">
            <p class="text-gray-800 italic mb-2">"${block.data.text}"</p>
            ${block.data.caption ? `<footer class="text-sm text-gray-600">— ${block.data.caption}</footer>` : ''}
          </blockquote>`;
        
        case 'code':
          return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto"><code>${escapeHtml(block.data.code)}</code></pre>`;
        
        case 'warning':
          return `<div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <span class="text-2xl">⚠️</span>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-bold text-yellow-800">${block.data.title}</h3>
                <p class="text-sm text-yellow-700 mt-1">${block.data.message}</p>
              </div>
            </div>
          </div>`;
        
        case 'table':
          const tableRows = block.data.content
            .map((row: string[], index: number) => {
              const cells = row
                .map(cell => {
                  const tag = index === 0 ? 'th' : 'td';
                  const className = index === 0 
                    ? 'px-4 py-2 bg-teal-100 font-semibold text-left' 
                    : 'px-4 py-2 border-t';
                  return `<${tag} class="${className}">${cell}</${tag}>`;
                })
                .join('');
              return `<tr>${cells}</tr>`;
            })
            .join('');
          return `<div class="overflow-x-auto mb-4">
            <table class="min-w-full border border-gray-300 rounded-lg">
              <tbody>${tableRows}</tbody>
            </table>
          </div>`;
        
        case 'delimiter':
          return `<hr class="my-8 border-t-2 border-gray-300" />`;
        
        case 'image':
          const imageUrl = block.data.file?.url || '';
          const imageCaption = block.data.caption || '';
          const withBorder = block.data.withBorder ? 'border border-gray-300' : '';
          const withBackground = block.data.withBackground ? 'bg-gray-50 p-4' : '';
          const stretched = block.data.stretched ? 'w-full' : 'max-w-2xl mx-auto';
          
          return `<figure class="my-6 ${stretched}">
            <img src="${imageUrl}" alt="${escapeHtml(imageCaption)}" class="rounded-lg ${withBorder} ${withBackground} w-full h-auto" />
            ${imageCaption ? `<figcaption class="text-center text-sm text-gray-600 mt-2 italic">${escapeHtml(imageCaption)}</figcaption>` : ''}
          </figure>`;
        
        case 'video':
          const videoUrl = block.data.file?.url || block.data.url || '';
          const videoCaption = block.data.caption || '';
          
          // Check if it's a direct video file or a platform URL
          const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg|mov)$/i);
          
          if (isDirectVideo) {
            // Direct video file
            return `<figure class="my-6">
              <video 
                src="${videoUrl}" 
                controls 
                class="w-full rounded-lg shadow-lg"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
              ${videoCaption ? `<figcaption class="text-center text-sm text-gray-600 mt-2 italic">${escapeHtml(videoCaption)}</figcaption>` : ''}
            </figure>`;
          } else {
            // Platform URL (YouTube, Vimeo, etc.) - use responsive iframe
            return `<figure class="my-6">
              <div class="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
                <iframe 
                  src="${videoUrl}" 
                  class="absolute top-0 left-0 w-full h-full"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                ></iframe>
              </div>
              ${videoCaption ? `<figcaption class="text-center text-sm text-gray-600 mt-2 italic">${escapeHtml(videoCaption)}</figcaption>` : ''}
            </figure>`;
          }
        
        case 'embed':
          const embedUrl = block.data.embed || block.data.source || '';
          const embedService = block.data.service || 'video';
          const embedCaption = block.data.caption || '';
          const embedWidth = block.data.width || 580;
          const embedHeight = block.data.height || 320;
          
          return `<figure class="my-6">
            <div class="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
              <iframe 
                src="${embedUrl}" 
                width="${embedWidth}" 
                height="${embedHeight}" 
                class="absolute top-0 left-0 w-full h-full"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
              ></iframe>
            </div>
            ${embedCaption ? `<figcaption class="text-center text-sm text-gray-600 mt-2">${escapeHtml(embedCaption)} (${embedService})</figcaption>` : ''}
          </figure>`;
        
        case 'layout':
          // Render layout as responsive columns
          const layoutType = block.data.layout?.type || 'container';
          const layoutClass = block.data.layout?.className || '';
          const itemContent = block.data.itemContent || {};
          const itemCount = Object.keys(itemContent).length;
          
          // Determine grid columns based on item count
          const gridCols = itemCount === 2 ? 'md:grid-cols-2' : 
                          itemCount === 3 ? 'md:grid-cols-3' : 
                          itemCount === 4 ? 'md:grid-cols-4' : 'md:grid-cols-2';
          
          // Recursively render blocks inside each column
          const renderLayoutBlocks = (blocks: any[]) => {
            return blocks.map(innerBlock => {
              // Recursively handle nested blocks
              switch (innerBlock.type) {
                case 'paragraph':
                  return `<p class="text-gray-700 mb-2">${innerBlock.data.text}</p>`;
                case 'header':
                  return `<h${innerBlock.data.level} class="font-bold mb-2">${innerBlock.data.text}</h${innerBlock.data.level}>`;
                case 'image':
                  return `<img src="${innerBlock.data.file?.url}" alt="${escapeHtml(innerBlock.data.caption || '')}" class="w-full rounded-lg" />`;
                case 'list':
                  const tag = innerBlock.data.style === 'ordered' ? 'ol' : 'ul';
                  const items = innerBlock.data.items.map((item: string) => `<li>${item}</li>`).join('');
                  return `<${tag} class="list-disc ml-4 mb-2">${items}</${tag}>`;
                default:
                  return '';
              }
            }).join('');
          };
          
          const columnsHtml = Object.entries(itemContent)
            .map(([key, item]: [string, any]) => {
              const blocksHtml = item.blocks ? renderLayoutBlocks(item.blocks) : '';
              return `<div class="p-4 bg-white rounded-lg border border-gray-200">${blocksHtml}</div>`;
            })
            .join('');
          
          return `<div class="grid grid-cols-1 ${gridCols} gap-4 my-6 ${layoutClass}">${columnsHtml}</div>`;
        
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Convert plain text to Editor.js format
 * For migrating existing content
 */
export function plainTextToEditorJs(text: string): OutputData {
  if (!text || text.trim() === '') {
    return {
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: ''
          }
        }
      ]
    };
  }

  // Split by double newlines to detect paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  const blocks = paragraphs.map(para => {
    const trimmed = para.trim();
    
    // Detect headers (lines starting with #)
    if (trimmed.startsWith('#')) {
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        return {
          type: 'header',
          data: {
            text: headerMatch[2],
            level: headerMatch[1].length
          }
        };
      }
    }
    
    // Detect images (lines with image markdown)
    if (trimmed.match(/^!\[.*\]\(.*\)$/)) {
      const imageMatch = trimmed.match(/^!\[(.*)\]\((.*)\)$/);
      if (imageMatch) {
        return {
          type: 'image',
          data: {
            file: {
              url: imageMatch[2]
            },
            caption: imageMatch[1],
            withBorder: false,
            stretched: false,
            withBackground: false
          }
        };
      }
    }
    
    // Detect lists (lines starting with - or *)
    if (trimmed.match(/^[-*]\s+/)) {
      const items = trimmed.split('\n').filter(line => line.trim().match(/^[-*]\s+/));
      return {
        type: 'list',
        data: {
          style: 'unordered',
          items: items.map(item => item.replace(/^[-*]\s+/, '').trim())
        }
      };
    }
    
    // Detect numbered lists
    if (trimmed.match(/^\d+\.\s+/)) {
      const items = trimmed.split('\n').filter(line => line.trim().match(/^\d+\.\s+/));
      return {
        type: 'list',
        data: {
          style: 'ordered',
          items: items.map(item => item.replace(/^\d+\.\s+/, '').trim())
        }
      };
    }
    
    // Default to paragraph
    return {
      type: 'paragraph',
      data: {
        text: trimmed.replace(/\n/g, '<br>')
      }
    };
  });

  return { blocks };
}

/**
 * Extract key information from Editor.js content
 */
export function extractKeyPoints(data: OutputData): string[] {
  if (!data || !data.blocks) return [];

  const keyPoints: string[] = [];

  data.blocks.forEach(block => {
    // Extract headers as key points
    if (block.type === 'header' && block.data.text) {
      keyPoints.push(block.data.text);
    }
    
    // Extract list items as key points
    if (block.type === 'list' && block.data.items) {
      keyPoints.push(...block.data.items.slice(0, 3)); // First 3 items
    }
    
    // Extract warning titles as key points
    if (block.type === 'warning' && block.data.title) {
      keyPoints.push(block.data.title);
    }
  });

  return keyPoints.slice(0, 5); // Return max 5 key points
}
