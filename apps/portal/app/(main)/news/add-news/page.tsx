"use client";

import React, { useState, useCallback, useRef, useEffect, FormEvent } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from "next/image";
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
  Textarea,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui';
import { 
  CalendarIcon, 
  Save as SaveIcon,
  Send as PublishIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Eye,
  X,
  Upload,
  Wand2,
  HelpCircle,
  Book,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { generateSEOTitle, generateExcerpt } from '@/lib/gemini';
import { useRouter } from 'next/navigation';
import { Image as TiptapImage } from '@tiptap/extension-image'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  status: z.enum(['draft', 'published']),
  category: z.string().min(1, 'Category is required'),
  publishDate: z.date(),
  tags: z.array(z.string()),
  featuredImage: z.instanceof(File).optional(),
})

type FormValues = z.infer<typeof formSchema>

const defaultValues: Partial<FormValues> = {
  title: "",
  content: "",
  excerpt: "",
  status: "draft",
  category: "",
  tags: []
};

const categories = [
  'Technology',
  'Agriculture',
  'Climate',
  'Education',
  'Healthcare',
  'Infrastructure'
];

// Add type for image dimensions
interface ImageDimensions {
  width: number;
  height: number;
}

interface ImagePreviewState {
  url: string;
  width: number;
  height: number;
}

const CustomImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: null,
        renderHTML: (attributes) => ({
          height: attributes.height,
        }),
      },
      caption: {
        default: null,
        renderHTML: (attributes) => ({
          'data-caption': attributes.caption,
        }),
      },
      alignment: {
        default: 'center',
        renderHTML: (attributes) => ({
          'data-alignment': attributes.alignment,
        }),
      },
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const figure = document.createElement('figure')
    figure.classList.add('image-figure')
    figure.setAttribute('data-alignment', node.attrs.alignment || 'center')

    const img = document.createElement('img')
    img.src = node.attrs.src
    if (node.attrs.width) img.width = node.attrs.width
    if (node.attrs.height) img.height = node.attrs.height
    img.classList.add('resizable-image')
    figure.appendChild(img)

    if (node.attrs.caption) {
      const caption = document.createElement('figcaption')
      caption.classList.add('image-caption')
      caption.textContent = node.attrs.caption
      figure.appendChild(caption)
    }

    return figure
  },
})

interface HelpSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

const sections: HelpSection[] = [
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about using the platform',
    icon: HelpCircle,
  },
  {
    id: 'documentation',
    title: 'Documentation',
    description: 'Detailed guides and documentation for all features',
    icon: Book,
  },
  {
    id: 'support',
    title: 'Support',
    description: 'Get help from our support team',
    icon: MessageCircle,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    description: 'Get in touch with our team',
    icon: Mail,
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How do I create a new article?',
    answer: 'To create a new article, navigate to the News section and click on the "Add News" button. Fill in the required fields including title, content, and any featured images. You can preview your article before publishing.',
  },
  {
    question: 'How do I manage my account settings?',
    answer: 'You can manage your account settings by clicking on the Settings icon in the sidebar. Here you can update your profile information, change your password, and customize your notification preferences.',
  },
  {
    question: 'What file types are supported for image uploads?',
    answer: 'We support JPEG, PNG, and GIF image formats. The maximum file size for uploads is 5MB.',
  },
  {
    question: 'How do I format my article content?',
    answer: 'The article editor provides rich text formatting options. You can use the toolbar to add headings, lists, links, and images. You can also use markdown syntax for quick formatting.',
  },
];

export default function AddNewsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<ImagePreviewState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const router = useRouter();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: 'draft' as const,
      category: '',
      publishDate: new Date(),
      tags: [],
    },
  });

  const { register, control, setValue, watch, formState: { errors } } = form;

  // Initialize editor with enhanced image support
  const editor = useEditor({
    extensions: [
      StarterKit,
      CustomImage,
    ],
    content: '',
    onUpdate({ editor }) {
      form.setValue('content', editor.getHTML())
    },
  });

  // Editor toolbar handlers
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
  const setHeading1 = () => editor?.chain().focus().toggleHeading({ level: 1 }).run();
  const setHeading2 = () => editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const undo = () => editor?.chain().focus().undo().run();
  const redo = () => editor?.chain().focus().redo().run();

  // Add image to editor with enhanced controls
  const addImage = useCallback((url: string, width: number, height: number) => {
    const maxWidth = 800;
    const aspectRatio = width / height;
    const newWidth = Math.min(width, maxWidth);
    const newHeight = Math.round(newWidth / aspectRatio);

    editor?.chain().focus().insertContent({
      type: 'image',
      attrs: {
        src: url,
        width: newWidth,
        height: newHeight,
        alignment: 'center',
      }
    }).run();
  }, [editor]);

  // Image controls dialog
  const showImageControls = (node: any) => {
    const dialog = document.createElement('dialog')
    dialog.classList.add('image-controls-dialog')
    
    const form = document.createElement('form')
    form.innerHTML = `
      <div class="flex flex-col gap-4 p-4">
        <div class="flex gap-4">
          <div class="flex flex-col gap-2">
            <label for="width">Width</label>
            <input type="number" id="width" value="${node.attrs.width || ''}" class="border p-2 rounded" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="height">Height</label>
            <input type="number" id="height" value="${node.attrs.height || ''}" class="border p-2 rounded" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <label for="caption">Caption</label>
          <input type="text" id="caption" value="${node.attrs.caption || ''}" class="border p-2 rounded" />
        </div>
        <div class="flex flex-col gap-2">
          <label for="alignment">Alignment</label>
          <select id="alignment" class="border p-2 rounded">
            <option value="left" ${node.attrs.alignment === 'left' ? 'selected' : ''}>Left</option>
            <option value="center" ${node.attrs.alignment === 'center' ? 'selected' : ''}>Center</option>
            <option value="right" ${node.attrs.alignment === 'right' ? 'selected' : ''}>Right</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button type="button" class="px-4 py-2 border rounded hover:bg-gray-100" onclick="this.closest('dialog').close()">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Update</button>
        </div>
      </div>
    `
    
    form.onsubmit = (e) => {
      e.preventDefault()
      const formData = new FormData(form)
      const width = parseInt(formData.get('width') as string)
      const height = parseInt(formData.get('height') as string)
      const caption = formData.get('caption') as string
      const alignment = formData.get('alignment') as string

      editor?.chain().focus().updateAttributes('image', {
        width: width || null,
        height: height || null,
        caption: caption || null,
        alignment: alignment || 'center'
      }).run()

      dialog.close()
    }

    dialog.appendChild(form)
    document.body.appendChild(dialog)
    dialog.showModal()
  };

  // Add global styles for image handling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .image-figure {
        margin: 1em 0;
        max-width: 100%;
      }
      .image-figure img {
        max-width: 100%;
        height: auto;
        cursor: pointer;
      }
      .image-caption {
        text-align: center;
        color: #666;
        font-size: 0.9em;
        margin-top: 0.5em;
      }
      .resizable-image {
        transition: all 0.2s ease;
      }
      .resizable-image:hover {
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG and GIF images are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target?.result) return;
      
      const img = document.createElement('img');
      img.onload = () => {
        const maxWidth = 800;
        const aspectRatio = img.height / img.width;
        const newWidth = Math.min(img.width, maxWidth);
        const newHeight = Math.round(newWidth * aspectRatio);

        setImagePreview({
          url: img.src,
          width: newWidth,
          height: newHeight
        });
        form.setValue('featuredImage', file);
      };
      img.src = e.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageClear = () => {
    setImagePreview(null);
    form.setValue("featuredImage", undefined);
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        setValue('tags', updatedTags);
        setTagInput('');
      }
    }
  };

  const handleTagRemove = (tag: string) => {
    const updatedTags = tags.filter(t => t !== tag);
    setTags(updatedTags);
    setValue('tags', updatedTags);
  };

  // Watch title for potential future use
  const title = watch('title');

  // Handle form submission
  const onSubmit = async (data: FormValues, event?: FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('excerpt', data.excerpt);
      formData.append('status', data.status);
      formData.append('category', data.category);
      formData.append('publishDate', data.publishDate.toISOString());
      formData.append('tags', JSON.stringify(data.tags));
      
      if (data.featuredImage) {
        formData.append('featuredImage', data.featuredImage);
      }

      const response = await fetch('http://localhost:3002/api/news', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit news article');
      }

      toast.success('News article submitted successfully');
      form.reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting news article:', error);
      toast.error('Failed to submit news article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateTitle = async () => {
    if (!editor?.getHTML()) {
      toast.error('Please add some content first')
      return
    }

    try {
      setIsGenerating(true)
      const content = editor.getHTML()
      const title = await generateSEOTitle(content)
      setValue('title', title)
      toast.success('Title generated successfully')
    } catch (error) {
      console.error('Error generating title:', error)
      toast.error('Failed to generate title')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateExcerpt = async () => {
    if (!editor?.getHTML()) {
      toast.error('Please add some content first')
      return
    }

    try {
      setIsGenerating(true)
      const content = editor.getHTML()
      const excerpt = await generateExcerpt(content)
      setValue('excerpt', excerpt)
      toast.success('Excerpt generated successfully')
    } catch (error) {
      console.error('Error generating excerpt:', error)
      toast.error('Failed to generate excerpt')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = (values: FormValues) => {
    if (!editor?.getHTML()) {
      toast.error('Please add some content first')
      return
    }

    const previewData = {
      title: values.title,
      content: editor.getHTML(),
      excerpt: values.excerpt,
      category: values.category,
      featuredImage: imagePreview ? {
        url: imagePreview.url,
        width: imagePreview.width,
        height: imagePreview.height
      } : null,
      publishDate: values.publishDate.toISOString()
    }

    sessionStorage.setItem('newsPreview', JSON.stringify(previewData))
    window.open('/news/preview', '_blank')
  }

  const [activeSection, setActiveSection] = useState('faq');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [filteredFaqs, setFilteredFaqs] = useState(faqData);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    const filtered = faqData.filter(
      faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
    );
    setFilteredFaqs(filtered);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'faq':
        return (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  className={`w-full text-left p-4 flex justify-between items-center ${
                    expandedFAQ === faq.question ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExpandedFAQ(expandedFAQ === faq.question ? null : faq.question)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <HelpCircle className={`w-5 h-5 transition-transform ${
                    expandedFAQ === faq.question ? 'rotate-180' : ''
                  }`} />
                </button>
                {expandedFAQ === faq.question && (
                  <div className="p-4 bg-white border-t">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'documentation':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Getting Started Guide</h3>
                <p className="text-gray-600 text-sm">Learn the basics of using our platform</p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Content Management</h3>
                <p className="text-gray-600 text-sm">Learn how to create and manage content</p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">User Management</h3>
                <p className="text-gray-600 text-sm">Understand user roles and permissions</p>
              </Card>
              <Card className="p-4 hover:bg-gray-50 cursor-pointer">
                <h3 className="font-medium mb-2">Advanced Features</h3>
                <p className="text-gray-600 text-sm">Explore advanced platform features</p>
              </Card>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Support Hours</h3>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM (CAT)</p>
              <p className="text-gray-600">Response time: Within 24 hours</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-medium mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our support team in real-time</p>
                <button className="text-green-700 hover:text-green-800 font-medium">
                  Start Chat
                </button>
              </Card>
              <Card className="p-4">
                <h3 className="font-medium mb-2">Submit a Ticket</h3>
                <p className="text-gray-600 mb-4">Create a support ticket for detailed assistance</p>
                <button className="text-green-700 hover:text-green-800 font-medium">
                  Create Ticket
                </button>
              </Card>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Mail className="w-5 h-5 text-green-700" />
                  <h3 className="font-medium">Email</h3>
                </div>
                <p className="text-gray-600">support@example.com</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Phone className="w-5 h-5 text-green-700" />
                  <h3 className="font-medium">Phone</h3>
                </div>
                <p className="text-gray-600">+250 123 456 789</p>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="font-medium mb-4">Send us a message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="How can we help?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800"
                >
                  Send Message
                </button>
              </form>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Add News</h1>
          <p className="text-gray-500">Create a new news article</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handlePreview(form.getValues())}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              form.setValue('status', 'draft');
            }}
            disabled={isSubmitting}
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button 
            onClick={() => {
              form.setValue('status', 'published');
            }}
            disabled={isSubmitting}
            className="bg-green-700 hover:bg-green-800"
          >
            <PublishIcon className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content - Takes up 2/3 of the space */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title field with AI generation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateTitle}
                    className="h-8"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate SEO Title
                  </Button>
                </div>
                <Input
                  id="title"
                  {...register("title")}
                  className="w-full"
                  placeholder="Enter article title"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Editor toolbar */}
              <div className="border rounded-lg p-2 space-y-4">
                <div className="flex items-center gap-1 border-b pb-2">
                  <Button variant="ghost" size="sm" onClick={toggleBold} className="h-8">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={toggleItalic} className="h-8">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={toggleBulletList} className="h-8">
                    <List className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={toggleOrderedList} className="h-8">
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={toggleBlockquote} className="h-8">
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={setHeading1} className="h-8">
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={setHeading2} className="h-8">
                    <Heading2 className="w-4 h-4" />
                  </Button>
                </div>
                <EditorContent editor={editor} className="min-h-[300px] prose max-w-none" />
              </div>

              {/* Excerpt field with AI generation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateExcerpt}
                    className="h-8"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Excerpt
                  </Button>
                </div>
                <Textarea
                  id="excerpt"
                  {...register("excerpt")}
                  className="w-full"
                  placeholder="Enter article excerpt"
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Takes up 1/3 of the space */}
        <div className="space-y-6">
          {/* Status and Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Publish Date */}
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Controller
                  name="publishDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-red-500 mt-2">{errors.category.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Remove tag"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                />
                <p className="text-sm text-muted-foreground">
                  Press enter to add tags
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="relative"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add('border-primary-green');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-primary-green');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.remove('border-primary-green');
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    handleImageUpload({ target: { files: [file] } } as any);
                  }
                }}
              >
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview.url}
                      alt="Preview"
                      width={imagePreview.width}
                      height={imagePreview.height}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleImageClear}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-primary-green transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Upload featured image</p>
                      <p className="text-xs text-gray-500">
                        Drag and drop your image here, or click to browse
                      </p>
                      <p className="text-xs text-gray-400">
                        Supports: JPEG, PNG, GIF (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                  title="Upload featured image"
                  aria-label="Upload featured image"
                  id="featured-image-upload"
                />
              </div>
              {errors.featuredImage && (
                <p className="text-sm text-red-500 mt-2">{errors.featuredImage.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}