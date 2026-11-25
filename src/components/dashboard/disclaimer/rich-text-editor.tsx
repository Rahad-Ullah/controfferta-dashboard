"use client";

import { Color } from "@tiptap/extension-color";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  Image as ImageIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Type,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FontSize } from "./extensions/font-size";
import { ImageWithAlignment } from "./extensions/image-with-alignment";

interface TipTapEditorProps {
  onChange?: (html: string) => void;
  resetTrigger?: boolean;
  content?: string;
  minHeight?: string;
  maxHeight?: string;
  height?: string;
  placeholder?: string;
  className?: string;
}

const PRESET_FONT_SIZES = ["12", "14", "16", "18", "20", "24", "28", "32"];

const PRESET_COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#0F172A",
  "#00BC7D",
  "#2563EB",
  "#DC2626",
  "#D97706",
  "#7C3AED",
  "#FFFFFF",
];

export default function TipTapEditor({
  onChange,
  resetTrigger = false,
  content = "",
  minHeight = "280px",
  maxHeight = "600px",
  height,
  placeholder = "Start typing...",
  className = "",
}: TipTapEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [textColor, setTextColor] = useState("#000000");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isUpdatingContent = useRef(false);
  const editorInitialized = useRef(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extensions
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          HTMLAttributes: {
            class: "list-disc pl-5 my-2",
          },
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: {
            class: "list-decimal pl-5 my-2",
          },
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
      Color,
      ImageWithAlignment.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "tiptap-image rounded-xl my-3 max-w-full",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#00BC7D] underline cursor-pointer",
        },
      }),
    ],
    []
  );

  // Editor instance
  const editor = useEditor({
    extensions,
    content: content || "",
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      if (isUpdatingContent.current) return;
      if (onChange) {
        onChange(ed.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none text-slate-700 leading-relaxed text-sm sm:text-base font-normal w-full min-h-full",
        "data-placeholder": placeholder,
        style: height
          ? `height: ${height}; min-height: ${height}; max-height: ${height}; overflow-y: auto;`
          : `min-height: ${minHeight}; ${maxHeight === "none" ? "" : `max-height: ${maxHeight};`} overflow-y: auto;`,
      },
    },
  });

  // Sync content from outside
  useEffect(() => {
    if (editor && !editorInitialized.current && content) {
      editor.commands.setContent(content);
      editorInitialized.current = true;
    }
  }, [editor, content]);

  useEffect(() => {
    if (resetTrigger && editor) {
      editor.commands.setContent("");
      editorInitialized.current = false;
    }
  }, [resetTrigger, editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML() && !isUpdatingContent.current) {
      isUpdatingContent.current = true;
      editor.commands.setContent(content || "");
      isUpdatingContent.current = false;
    }
  }, [content, editor]);

  // Handle font size change
  const handleFontSizeSelect = (size: string) => {
    if (editor) {
      (editor.chain().focus() as unknown as { setFontSize: (s: string) => { run: () => void } })
        .setFontSize(size)
        .run();
      setFontSize(size);
    }
    setShowFontSizeDropdown(false);
  };

  // Handle text color change
  const handleColorChange = (color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run();
      setTextColor(color);
    }
    setShowColorPicker(false);
  };

  // Image Upload
  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          if (editor && src) {
            editor
              .chain()
              .focus()
              .setImage({ src, alt: file.name })
              .run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [editor]);

  // Link Insertion
  const handleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        fontSizeRef.current &&
        !fontSizeRef.current.contains(e.target as Node)
      ) {
        setShowFontSizeDropdown(false);
      }
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted || !editor) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="h-10 w-80 bg-slate-100 rounded-xl animate-pulse" />
        <div
          className="w-full bg-slate-50/50 rounded-xl animate-pulse"
          style={{ minHeight }}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ── Green Toolbar (Matching Screenshots) ── */}
      <div className="inline-flex items-center gap-1 bg-[#00BC7D] text-white px-3 py-1.5 rounded-xl shadow-xs flex-wrap">
        {/* 1. Font Size Dropdown */}
        <div className="relative" ref={fontSizeRef}>
          <button
            type="button"
            onClick={() => {
              setShowFontSizeDropdown(!showFontSizeDropdown);
              setShowColorPicker(false);
            }}
            className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-white/15 text-xs font-semibold cursor-pointer transition-colors"
            title="Font Size"
          >
            <span>{fontSize}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-90" />
          </button>

          {showFontSizeDropdown && (
            <div className="absolute left-0 mt-2 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50 w-20">
              {PRESET_FONT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleFontSizeSelect(sz)}
                  className={`w-full text-left px-3 py-1 text-xs hover:bg-[#E6F8F2] hover:text-[#00BC7D] cursor-pointer ${
                    fontSize === sz ? "font-bold text-[#00BC7D]" : ""
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/30 mx-0.5" />

        {/* 2. Text Icon & Color Dot */}
        <div className="relative flex items-center gap-1.5 px-1" ref={colorPickerRef}>
          <Type className="w-3.5 h-3.5 opacity-95" />
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowFontSizeDropdown(false);
            }}
            className="w-3.5 h-3.5 rounded-full border border-white/80 shadow-2xs cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: textColor === "#000000" ? "#ffffff" : textColor }}
            title="Text Color"
          />

          {showColorPicker && (
            <div className="absolute left-0 mt-8 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-2.5 z-50 w-44">
              <div className="text-[10px] font-semibold text-slate-400 uppercase mb-2">
                Colors
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleColorChange(col)}
                    className="w-6 h-6 rounded-md border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: col }}
                    title={col}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/30 mx-0.5" />

        {/* 3. Formatting: B, I, U, S */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("bold") ? "bg-white/25" : ""
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`w-6 h-6 rounded flex items-center justify-center italic font-serif text-xs hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("italic") ? "bg-white/25" : ""
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`w-6 h-6 rounded flex items-center justify-center underline text-xs hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("underline") ? "bg-white/25" : ""
            }`}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`w-6 h-6 rounded flex items-center justify-center line-through text-xs hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("strike") ? "bg-white/25" : ""
            }`}
            title="Strikethrough"
          >
            S
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/30 mx-0.5" />

        {/* 4. Alignment: Left, Center, Right */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive({ textAlign: "left" }) ? "bg-white/25" : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive({ textAlign: "center" }) ? "bg-white/25" : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive({ textAlign: "right" }) ? "bg-white/25" : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/30 mx-0.5" />

        {/* 5. Lists: Ordered & Bullet */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("orderedList") ? "bg-white/25" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("bulletList") ? "bg-white/25" : ""
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/30 mx-0.5" />

        {/* 6. Media & Link: Image, Link */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleImageUpload}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors"
            title="Insert Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleLink}
            className={`w-6 h-6 rounded flex items-center justify-center hover:bg-white/15 cursor-pointer transition-colors ${
              editor.isActive("link") ? "bg-white/25" : ""
            }`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Editor Content Area ── */}
      <div
        onClick={() => editor?.commands.focus()}
        className="flex-1 w-full min-h-[450px] p-5 sm:p-6 rounded-xl border border-slate-200/80 bg-slate-50/20 focus-within:bg-white focus-within:border-[#00BC7D]/50 transition-all flex flex-col cursor-text"
      >
        <EditorContent
          editor={editor}
          className="flex-1 w-full flex flex-col min-h-0 [&_.ProseMirror]:flex-1 [&_.ProseMirror]:w-full [&_.ProseMirror]:h-full [&_.ProseMirror]:focus:outline-none"
        />
      </div>
    </div>
  );
}
