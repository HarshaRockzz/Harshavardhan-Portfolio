import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import emailjs from "@emailjs/browser";
import EarthCanvas from "../canvas/Earth";

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 1;
  align-items: center;
  @media (max-width: 960px) {
    padding: 0px;
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  width: 100%;
  max-width: 1350px;
  padding: 0px 0px 80px 0px;
  gap: 12px;
  @media (max-width: 960px) {
    flex-direction: column;
  }
`;

const Title = styled.div`
  font-size: 52px;
  text-align: center;
  font-weight: 600;
  margin-top: 20px;
  color: ${({ theme }) => theme.text_primary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 32px;
  }
`;

const Desc = styled.div`
  font-size: 18px;
  text-align: center;
  max-width: 600px;
  color: ${({ theme }) => theme.text_secondary};
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 16px;
  }
`;
const ContactForm = styled.form`
  width: 95%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  background-color: rgba(17, 25, 40, 0.83);
  border: 1px solid rgba(255, 255, 255, 0.125);
  padding: 32px;
  border-radius: 12px;
  box-shadow: rgba(23, 92, 230, 0.1) 0px 4px 24px;
  margin-top: 28px;
  gap: 12px;
`;
const ContactTitle = styled.div`
  font-size: 28px;
  margin-bottom: 6px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;
const ContactInput = styled.input`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary + 50};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
`;
const ContactInputMessage = styled.textarea`
  flex: 1;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.text_secondary + 50};
  outline: none;
  font-size: 18px;
  color: ${({ theme }) => theme.text_primary};
  border-radius: 12px;
  padding: 12px 16px;
  &:focus {
    border: 1px solid ${({ theme }) => theme.primary};
  }
`;
const ContactButton = styled.input`
  width: 100%;
  text-decoration: none;
  text-align: center;
  background: hsla(271, 100%, 50%, 1);
  background: linear-gradient(
    225deg,
    hsla(271, 100%, 50%, 1) 0%,
    hsla(294, 100%, 50%, 1) 100%
  );
  background: -moz-linear-gradient(
    225deg,
    hsla(271, 100%, 50%, 1) 0%,
    hsla(294, 100%, 50%, 1) 100%
  );
  background: -webkit-linear-gradient(
    225deg,
    hsla(271, 100%, 50%, 1) 0%,
    hsla(294, 100%, 50%, 1) 100%
  );
  padding: 13px 16px;
  margin-top: 2px;
  border-radius: 12px;
  border: none;
  color: ${({ theme }) => theme.text_primary};
  font-size: 18px;
  font-weight: 600;
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.4s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
  animation: bounce 0.6s ease-in-out;

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

const ModalTitle = styled.h2`
  color: white;
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: 600;
`;

const ModalMessage = styled.p`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 30px 0;
  font-size: 16px;
  line-height: 1.5;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const Contact = () => {
  const form = useRef();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    emailjs.init("exTQaEnRII6Tw2Xd0");
    console.log("EmailJS initialized");
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Form submitted");
    console.log("Form data:", form.current);
    
    // Add current time to form data in IST
    const currentTime = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata',
      timeZoneName: 'short'
    });
    
    // Create a hidden input for time
    const timeInput = document.createElement('input');
    timeInput.type = 'hidden';
    timeInput.name = 'time';
    timeInput.value = currentTime;
    form.current.appendChild(timeInput);
    
    // Show loading state
    const submitButton = e.target.querySelector('input[type="submit"]');
    const originalValue = submitButton.value;
    submitButton.value = "Sending...";
    submitButton.disabled = true;

    emailjs
      .sendForm(
        "service_en6ojyj",
        "template_734etgo",
        form.current,
        "exTQaEnRII6Tw2Xd0"
      )
      .then(
        (result) => {
          console.log("SUCCESS:", result);
          setShowSuccessModal(true);
          form.current.reset();
        },
        (error) => {
          console.log("FAILED:", error);
          alert("Failed to send message. Please try again.");
        }
      )
      .finally(() => {
        // Reset button state
        submitButton.value = originalValue;
        submitButton.disabled = false;
        
        // Remove the hidden time input
        const timeInput = form.current.querySelector('input[name="time"]');
        if (timeInput) {
          timeInput.remove();
        }
      });
  };

  return (
    <Container>
      <Wrapper>
        <EarthCanvas />
        <Title>Contact</Title>
        <Desc>
          Feel free to reach out to me for any questions or opportunities!
        </Desc>
        <ContactForm ref={form} onSubmit={handleSubmit}>
          <ContactTitle>Email Me 🚀</ContactTitle>
          <ContactInput 
            placeholder="Your Email" 
            name="email" 
            type="email"
            required 
          />
          <ContactInput 
            placeholder="Your Name" 
            name="name" 
            type="text"
            required 
          />
          <ContactInput 
            placeholder="Subject" 
            name="title" 
            type="text"
            required 
          />
          <ContactInputMessage 
            placeholder="Message" 
            name="message" 
            rows={4}
            required 
          />
          <ContactButton type="submit" value="Send" />
        </ContactForm>
      </Wrapper>

      {showSuccessModal && (
        <SuccessModal onClick={() => setShowSuccessModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <SuccessIcon>✅</SuccessIcon>
            <ModalTitle>Message Sent!</ModalTitle>
            <ModalMessage>
              Thank you for reaching out! I'll get back to you as soon as possible.
            </ModalMessage>
            <CloseButton onClick={() => setShowSuccessModal(false)}>
              Awesome! 🎉
            </CloseButton>
          </ModalContent>
        </SuccessModal>
      )}
    </Container>
  );
};

export default Contact;
