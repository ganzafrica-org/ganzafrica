"use client";

import React from 'react';

interface ContactUsContentProps {
    dict: {
        [key: string]: string;
    };
}

const ContactUsContent = ({ dict }: ContactUsContentProps) => {
    const [formState, setFormState] = React.useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        subject: ""
    });

    return (
        <div>
            {/* Your component JSX here */}
        </div>
    );
};

export default ContactUsContent; 