'use client'
import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import '@/app/ckeditor5.css';
import { decode } from 'entities';

// Dynamically import CKEditor components to prevent duplication and SSR issues
const CKEditor = dynamic(() => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor), {
  ssr: false,
  loading: () => <div>Loading editor...</div>
});

const ClassicEditor = dynamic(() => import('ckeditor5').then(mod => mod.ClassicEditor), { ssr: false });
const Alignment = dynamic(() => import('ckeditor5').then(mod => mod.Alignment), { ssr: false });
const Autoformat = dynamic(() => import('ckeditor5').then(mod => mod.Autoformat), { ssr: false });
const AutoImage = dynamic(() => import('ckeditor5').then(mod => mod.AutoImage), { ssr: false });
const Autosave = dynamic(() => import('ckeditor5').then(mod => mod.Autosave), { ssr: false });
const BalloonToolbar = dynamic(() => import('ckeditor5').then(mod => mod.BalloonToolbar), { ssr: false });
const Base64UploadAdapter = dynamic(() => import('ckeditor5').then(mod => mod.Base64UploadAdapter), { ssr: false });
const BlockQuote = dynamic(() => import('ckeditor5').then(mod => mod.BlockQuote), { ssr: false });
const Bold = dynamic(() => import('ckeditor5').then(mod => mod.Bold), { ssr: false });
const Bookmark = dynamic(() => import('ckeditor5').then(mod => mod.Bookmark), { ssr: false });
const Code = dynamic(() => import('ckeditor5').then(mod => mod.Code), { ssr: false });
const CodeBlock = dynamic(() => import('ckeditor5').then(mod => mod.CodeBlock), { ssr: false });
const Emoji = dynamic(() => import('ckeditor5').then(mod => mod.Emoji), { ssr: false });
const Essentials = dynamic(() => import('ckeditor5').then(mod => mod.Essentials), { ssr: false });
const FindAndReplace = dynamic(() => import('ckeditor5').then(mod => mod.FindAndReplace), { ssr: false });
const FontBackgroundColor = dynamic(() => import('ckeditor5').then(mod => mod.FontBackgroundColor), { ssr: false });
const FontColor = dynamic(() => import('ckeditor5').then(mod => mod.FontColor), { ssr: false });
const FontFamily = dynamic(() => import('ckeditor5').then(mod => mod.FontFamily), { ssr: false });
const FontSize = dynamic(() => import('ckeditor5').then(mod => mod.FontSize), { ssr: false });
const FullPage = dynamic(() => import('ckeditor5').then(mod => mod.FullPage), { ssr: false });
const GeneralHtmlSupport = dynamic(() => import('ckeditor5').then(mod => mod.GeneralHtmlSupport), { ssr: false });
const Heading = dynamic(() => import('ckeditor5').then(mod => mod.Heading), { ssr: false });
const Highlight = dynamic(() => import('ckeditor5').then(mod => mod.Highlight), { ssr: false });
const HorizontalLine = dynamic(() => import('ckeditor5').then(mod => mod.HorizontalLine), { ssr: false });
const HtmlComment = dynamic(() => import('ckeditor5').then(mod => mod.HtmlComment), { ssr: false });
const HtmlEmbed = dynamic(() => import('ckeditor5').then(mod => mod.HtmlEmbed), { ssr: false });
const ImageBlock = dynamic(() => import('ckeditor5').then(mod => mod.ImageBlock), { ssr: false });
const ImageCaption = dynamic(() => import('ckeditor5').then(mod => mod.ImageCaption), { ssr: false });
const ImageInline = dynamic(() => import('ckeditor5').then(mod => mod.ImageInline), { ssr: false });
const ImageInsert = dynamic(() => import('ckeditor5').then(mod => mod.ImageInsert), { ssr: false });
const ImageInsertViaUrl = dynamic(() => import('ckeditor5').then(mod => mod.ImageInsertViaUrl), { ssr: false });
const ImageResize = dynamic(() => import('ckeditor5').then(mod => mod.ImageResize), { ssr: false });
const ImageStyle = dynamic(() => import('ckeditor5').then(mod => mod.ImageStyle), { ssr: false });
const ImageTextAlternative = dynamic(() => import('ckeditor5').then(mod => mod.ImageTextAlternative), { ssr: false });
const ImageToolbar = dynamic(() => import('ckeditor5').then(mod => mod.ImageToolbar), { ssr: false });
const ImageUpload = dynamic(() => import('ckeditor5').then(mod => mod.ImageUpload), { ssr: false });
const Indent = dynamic(() => import('ckeditor5').then(mod => mod.Indent), { ssr: false });
const IndentBlock = dynamic(() => import('ckeditor5').then(mod => mod.IndentBlock), { ssr: false });
const Italic = dynamic(() => import('ckeditor5').then(mod => mod.Italic), { ssr: false });
const Link = dynamic(() => import('ckeditor5').then(mod => mod.Link), { ssr: false });
const LinkImage = dynamic(() => import('ckeditor5').then(mod => mod.LinkImage), { ssr: false });
const List = dynamic(() => import('ckeditor5').then(mod => mod.List), { ssr: false });
const ListProperties = dynamic(() => import('ckeditor5').then(mod => mod.ListProperties), { ssr: false });
const Markdown = dynamic(() => import('ckeditor5').then(mod => mod.Markdown), { ssr: false });
const MediaEmbed = dynamic(() => import('ckeditor5').then(mod => mod.MediaEmbed), { ssr: false });
const Mention = dynamic(() => import('ckeditor5').then(mod => mod.Mention), { ssr: false });
const PageBreak = dynamic(() => import('ckeditor5').then(mod => mod.PageBreak), { ssr: false });
const Paragraph = dynamic(() => import('ckeditor5').then(mod => mod.Paragraph), { ssr: false });
const PasteFromOffice = dynamic(() => import('ckeditor5').then(mod => mod.PasteFromOffice), { ssr: false });
const RemoveFormat = dynamic(() => import('ckeditor5').then(mod => mod.RemoveFormat), { ssr: false });
const ShowBlocks = dynamic(() => import('ckeditor5').then(mod => mod.ShowBlocks), { ssr: false });
const SourceEditing = dynamic(() => import('ckeditor5').then(mod => mod.SourceEditing), { ssr: false });
const SpecialCharacters = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharacters), { ssr: false });
const SpecialCharactersArrows = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharactersArrows), { ssr: false });
const SpecialCharactersCurrency = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharactersCurrency), { ssr: false });
const SpecialCharactersEssentials = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharactersEssentials), { ssr: false });
const SpecialCharactersLatin = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharactersLatin), { ssr: false });
const SpecialCharactersMathematical = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharactersMathematical), { ssr: false });
const SpecialCharactersText = dynamic(() => import('ckeditor5').then(mod => mod.SpecialCharactersText), { ssr: false });
const Strikethrough = dynamic(() => import('ckeditor5').then(mod => mod.Strikethrough), { ssr: false });
const Style = dynamic(() => import('ckeditor5').then(mod => mod.Style), { ssr: false });
const Subscript = dynamic(() => import('ckeditor5').then(mod => mod.Subscript), { ssr: false });
const Superscript = dynamic(() => import('ckeditor5').then(mod => mod.Superscript), { ssr: false });
const Table = dynamic(() => import('ckeditor5').then(mod => mod.Table), { ssr: false });
const TableCaption = dynamic(() => import('ckeditor5').then(mod => mod.TableCaption), { ssr: false });
const TableCellProperties = dynamic(() => import('ckeditor5').then(mod => mod.TableCellProperties), { ssr: false });
const TableColumnResize = dynamic(() => import('ckeditor5').then(mod => mod.TableColumnResize), { ssr: false });
const TableProperties = dynamic(() => import('ckeditor5').then(mod => mod.TableProperties), { ssr: false });
const TableToolbar = dynamic(() => import('ckeditor5').then(mod => mod.TableToolbar), { ssr: false });
const TextPartLanguage = dynamic(() => import('ckeditor5').then(mod => mod.TextPartLanguage), { ssr: false });
const TextTransformation = dynamic(() => import('ckeditor5').then(mod => mod.TextTransformation), { ssr: false });
const TodoList = dynamic(() => import('ckeditor5').then(mod => mod.TodoList), { ssr: false });
const Underline = dynamic(() => import('ckeditor5').then(mod => mod.Underline), { ssr: false });
const WordCount = dynamic(() => import('ckeditor5').then(mod => mod.WordCount), { ssr: false });


/**
 * Create a free account with a trial: https://portal.ckeditor.com/checkout?plan=free
 */
const LICENSE_KEY = 'GPL'; // or <YOUR_LICENSE_KEY>.

export default function Editor({ onChange, initialData }) {
    const editorContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    useEffect(() => {
        setIsLayoutReady(true);

        return () => setIsLayoutReady(false);
    }, []);

    const { editorConfig } = useMemo(() => {
        if (!isLayoutReady) {
            return {};
        }

        return {
            editorConfig: {
                toolbar: {
                    items: [
                        'sourceEditing',
                        'showBlocks',
                        'findAndReplace',
                        '|',
                        'heading',
                        'style',
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
                        'subscript',
                        'superscript',
                        'code',
                        'removeFormat',
                        '|',
                        'emoji',
                        'specialCharacters',
                        'horizontalLine',
                        'pageBreak',
                        'link',
                        'bookmark',
                        'insertImage',
                        'mediaEmbed',
                        'insertTable',
                        'highlight',
                        'blockQuote',
                        'codeBlock',
                        'htmlEmbed',
                        '|',
                        'alignment',
                        '|',
                        'bulletedList',
                        'numberedList',
                        'todoList',
                        'outdent',
                        'indent'
                    ],
                    shouldNotGroupWhenFull: false
                },
                balloonToolbar: ['bold', 'italic', '|', 'link', 'insertImage', '|', 'bulletedList', 'numberedList'],
                fontFamily: {
                    supportAllValues: true
                },
                plugins: [
                    Alignment,
                    Autoformat,
                    AutoImage,
                    Autosave,
                    BalloonToolbar,
                    Base64UploadAdapter,
                    BlockQuote,
                    Bold,
                    Bookmark,
                    Code,
                    CodeBlock,
                    Emoji,
                    Essentials,
                    FindAndReplace,
                    FontBackgroundColor,
                    FontColor,
                    FontFamily,
                    FontSize,
                    FullPage,
                    GeneralHtmlSupport,
                    Heading,
                    Highlight,
                    HorizontalLine,
                    HtmlComment,
                    HtmlEmbed,
                    ImageBlock,
                    ImageCaption,
                    ImageInline,
                    ImageInsert,
                    ImageInsertViaUrl,
                    ImageResize,
                    ImageStyle,
                    ImageTextAlternative,
                    ImageToolbar,
                    ImageUpload,
                    Indent,
                    IndentBlock,
                    Italic,
                    Link,
                    LinkImage,
                    List,
                    ListProperties,
                    Markdown,
                    MediaEmbed,
                    Mention,
                    PageBreak,
                    Paragraph,
                    PasteFromOffice,
                    RemoveFormat,
                    ShowBlocks,
                    SourceEditing,
                    SpecialCharacters,
                    SpecialCharactersArrows,
                    SpecialCharactersCurrency,
                    SpecialCharactersEssentials,
                    SpecialCharactersLatin,
                    SpecialCharactersMathematical,
                    SpecialCharactersText,
                    Strikethrough,
                    Style,
                    Subscript,
                    Superscript,
                    Table,
                    TableCaption,
                    TableCellProperties,
                    TableColumnResize,
                    TableProperties,
                    TableToolbar,
                    TextPartLanguage,
                    TextTransformation,
                    TodoList,
                    Underline,
                    WordCount
                ],
                fontSize: {
                    options: [10, 12, 14, 'default', 18, 20, 22],
                    supportAllValues: true
                },
                heading: {
                    options: [
                        {
                            model: 'paragraph',
                            title: 'Paragraph',
                            class: 'ck-heading_paragraph'
                        },
                        {
                            model: 'heading1',
                            view: 'h1',
                            title: 'Heading 1',
                            class: 'ck-heading_heading1'
                        },
                        {
                            model: 'heading2',
                            view: 'h2',
                            title: 'Heading 2',
                            class: 'ck-heading_heading2'
                        },
                        {
                            model: 'heading3',
                            view: 'h3',
                            title: 'Heading 3',
                            class: 'ck-heading_heading3'
                        },
                        {
                            model: 'heading4',
                            view: 'h4',
                            title: 'Heading 4',
                            class: 'ck-heading_heading4'
                        },
                        {
                            model: 'heading5',
                            view: 'h5',
                            title: 'Heading 5',
                            class: 'ck-heading_heading5'
                        },
                        {
                            model: 'heading6',
                            view: 'h6',
                            title: 'Heading 6',
                            class: 'ck-heading_heading6'
                        }
                    ]
                },
                htmlSupport: {
                    allow: [
                        {
                            name: /^.*$/,
                            styles: true,
                            attributes: true,
                            classes: true
                        }
                    ]
                },
                image: {
                    toolbar: [
                        'toggleImageCaption',
                        'imageTextAlternative',
                        '|',
                        'imageStyle:inline',
                        'imageStyle:wrapText',
                        'imageStyle:breakText',
                        '|',
                        'resizeImage'
                    ]
                },
                initialData: initialData && initialData != '' ? decode(initialData) : '',
                licenseKey: LICENSE_KEY,
                link: {
                    addTargetToExternalLinks: true,
                    defaultProtocol: 'https://',
                    decorators: {
                        toggleDownloadable: {
                            mode: 'manual',
                            label: 'Downloadable',
                            attributes: {
                                download: 'file'
                            }
                        }
                    }
                },
                list: {
                    properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true
                    }
                },
                
                style: {
                    definitions: [
                        {
                            name: 'Article category',
                            element: 'h3',
                            classes: ['category']
                        },
                        {
                            name: 'Title',
                            element: 'h2',
                            classes: ['document-title']
                        },
                        {
                            name: 'Subtitle',
                            element: 'h3',
                            classes: ['document-subtitle']
                        },
                        {
                            name: 'Info box',
                            element: 'p',
                            classes: ['info-box']
                        },
                        {
                            name: 'Side quote',
                            element: 'blockquote',
                            classes: ['side-quote']
                        },
                        {
                            name: 'Marker',
                            element: 'span',
                            classes: ['marker']
                        },
                        {
                            name: 'Spoiler',
                            element: 'span',
                            classes: ['spoiler']
                        },
                        {
                            name: 'Code (dark)',
                            element: 'pre',
                            classes: ['fancy-code', 'fancy-code-dark']
                        },
                        {
                            name: 'Code (bright)',
                            element: 'pre',
                            classes: ['fancy-code', 'fancy-code-bright']
                        }
                    ]
                },
                table: {
                    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
                }
            }
        };
    }, [isLayoutReady]);

    return (
        <div  >
            <div ref={editorContainerRef}>
                <div ref={editorRef}>{editorConfig && <CKEditor editor={ClassicEditor} config={editorConfig} onChange={onChange} />}</div>
            </div>
        </div>
    );
}
