"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Leaf,
    Loader2,
    Mail,
    Calendar,
    MapPin,
    FileText,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    Download,
    Eye
} from 'lucide-react';
import Link from 'next/link';

// Dummy application data
const dummyApplications = [
    {
        id: 1,
        email: "john.doe@email.com",
        jobTitle: "Senior Agricultural Specialist",
        status: "interview_scheduled",
        appliedDate: "2024-12-08",
        stage: "Technical Interview",
        stageDetails: "Your technical interview has been scheduled for December 15, 2024 at 2:00 PM",
        nextSteps: "Please prepare for a 1-hour technical discussion about sustainable farming practices",
        documents: [
            { name: "CV_John_Doe.pdf", uploaded: "2024-12-08", status: "verified" },
            { name: "Cover_Letter.pdf", uploaded: "2024-12-08", status: "verified" },
            { name: "Certificates.pdf", uploaded: "2024-12-08", status: "pending" }
        ],
        timeline: [
            { stage: "Application Submitted", date: "2024-12-08", status: "completed" },
            { stage: "Initial Screening", date: "2024-12-09", status: "completed" },
            { stage: "Technical Interview", date: "2024-12-15", status: "upcoming" },
            { stage: "HR Interview", date: "TBD", status: "pending" },
            { stage: "Final Decision", date: "TBD", status: "pending" }
        ]
    },
    {
        id: 2,
        email: "jane.smith@email.com",
        jobTitle: "Youth Fellow - Environment",
        status: "under_review",
        appliedDate: "2024-12-07",
        stage: "CV Screening",
        stageDetails: "Your application is currently being reviewed by our HR team",
        nextSteps: "We will contact you within 5-7 business days with an update",
        documents: [
            { name: "CV_Jane_Smith.pdf", uploaded: "2024-12-07", status: "verified" },
            { name: "Cover_Letter.pdf", uploaded: "2024-12-07", status: "verified" }
        ],
        timeline: [
            { stage: "Application Submitted", date: "2024-12-07", status: "completed" },
            { stage: "Initial Screening", date: "In Progress", status: "current" },
            { stage: "Technical Assessment", date: "TBD", status: "pending" },
            { stage: "Interview", date: "TBD", status: "pending" },
            { stage: "Final Decision", date: "TBD", status: "pending" }
        ]
    }
];

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'under_review':
            return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
        case 'interview_scheduled':
            return <Badge className="bg-yellow-100 text-yellow-800">Interview Scheduled</Badge>
        case 'shortlisted':
            return <Badge className="bg-green-100 text-green-800">Shortlisted</Badge>
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800">Not Selected</Badge>
        case 'hired':
            return <Badge className="bg-green-600 text-white">Congratulations! Hired</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getDocumentStatusBadge = (status: string) => {
    switch (status) {
        case 'verified':
            return <Badge className="bg-green-100 text-green-800">Verified</Badge>
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800">Needs Update</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getTimelineIcon = (status: string) => {
    switch (status) {
        case 'completed':
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'current':
            return <Clock className="h-4 w-4 text-blue-600" />
        case 'upcoming':
            return <Calendar className="h-4 w-4 text-yellow-600" />
        default:
            return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
}

export default function ApplicantCheckPage() {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState<'email' | 'verification' | 'results'>('email');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [applicationData, setApplicationData] = useState<any>(null);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if email exists in dummy data
        const application = dummyApplications.find(app => app.email === email);

        if (application) {
            // In real app, send verification code via email
            setStep('verification');
        } else {
            setError('No application found with this email address.');
        }

        setIsLoading(false);
    };

    const handleVerificationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demo, accept any 6-digit code
        if (verificationCode.length === 6) {
            const application = dummyApplications.find(app => app.email === email);
            setApplicationData(application);
            setStep('results');
        } else {
            setError('Invalid verification code. Please try again.');
        }

        setIsLoading(false);
    };

    const handleTryAnotherEmail = () => {
        setStep('email');
        setEmail('');
        setVerificationCode('');
        setError('');
        setApplicationData(null);
    };

    if (step === 'results' && applicationData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-2">
                        <div className="flex justify-center">
                            <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
                                <Leaf className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
                        <p className="text-sm text-gray-600">GanzAfrica HR Platform</p>
                    </div>

                    {/* Main Application Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">{applicationData.jobTitle}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Applied on {new Date(applicationData.appliedDate).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                {getStatusBadge(applicationData.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Current Stage</Label>
                                    <p className="text-sm">{applicationData.stage}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Email</Label>
                                    <p className="text-sm">{applicationData.email}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Stage Details</Label>
                                <p className="text-sm text-muted-foreground">{applicationData.stageDetails}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Next Steps</Label>
                                <p className="text-sm text-muted-foreground">{applicationData.nextSteps}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Application Timeline</CardTitle>
                            <CardDescription>Track your progress through our hiring process</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {applicationData.timeline.map((item: any, index: number) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        {getTimelineIcon(item.status)}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${
                                                item.status === 'completed' ? 'text-green-700' :
                                                    item.status === 'current' ? 'text-blue-700' :
                                                        item.status === 'upcoming' ? 'text-yellow-700' :
                                                            'text-gray-500'
                                            }`}>
                                                {item.stage}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{item.date}</p>
                                        </div>
                                        {item.status === 'completed' && (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Submitted Documents</CardTitle>
                            <CardDescription>Status of your uploaded documents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {applicationData.documents.map((doc: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Uploaded: {new Date(doc.uploaded).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getDocumentStatusBadge(doc.status)}
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="outline" onClick={handleTryAnotherEmail}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Check Another Application
                        </Button>
                        <Button asChild>
                            <Link href="/login">
                                Access Full Platform
                            </Link>
                        </Button>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                        <p>Need help? Contact us at hr@ganzafrica.org</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo and Header */}
                <div className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full">
                            <Leaf className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Check Application Status</h1>
                    <p className="text-sm text-gray-600">Enter your email to view your application status</p>
                </div>

                {step === 'email' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Enter Your Email</CardTitle>
                            <CardDescription>
                                We'll send you a verification code to access your application status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending Code...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Send Verification Code
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Demo emails */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-xs font-medium text-blue-900 mb-2">Demo Emails:</p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setEmail('john.doe@email.com')}
                                        className="block w-full text-left text-xs text-blue-700 hover:text-blue-900"
                                    >
                                        john.doe@email.com
                                    </button>
                                    <button
                                        onClick={() => setEmail('jane.smith@email.com')}
                                        className="block w-full text-left text-xs text-blue-700 hover:text-blue-900"
                                    >
                                        jane.smith@email.com
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 'verification' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Enter Verification Code</CardTitle>
                            <CardDescription>
                                We've sent a 6-digit code to {email}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerificationSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Verification Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        placeholder="123456"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        maxLength={6}
                                        required
                                        disabled={isLoading}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Demo: Enter any 6-digit number
                                    </p>
                                </div>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep('email')}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-sm text-green-600 hover:text-green-700"
                    >
                        Staff Login
                    </Link>
                </div>

                <div className="text-center text-xs text-gray-500">
                    <p>© 2024 GanzAfrica. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}