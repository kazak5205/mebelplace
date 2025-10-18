'use client';

import React, { useState } from 'react';
import {
  GlassButton,
  GlassIconButton,
  GlassFloatingButton,
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassCardFooter,
  GlassInput,
  GlassModal,
  GlassSidebar,
  GlassForm,
  GlassSelect,
  GlassCheckbox,
  GlassRadio,
  GlassTextarea,
  GlassToast,
  GlassAlert,
  GlassLoading,
  GlassEmpty,
  GlassLayout
} from '@/components/ui/glass';

export default function GlassDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    newsletter: false,
    gender: '',
    message: ''
  });

  const navItems = [
    { label: 'Home', icon: '🏠', href: '#', active: true },
    { label: 'About', icon: 'ℹ️', href: '#' },
    { label: 'Contact', icon: '📧', href: '#' }
  ];

  const breadcrumbItems = [
    { label: 'Home', href: '#' },
    { label: 'Components', href: '#' },
    { label: 'Glass Demo', active: true }
  ];

  const selectOptions = [
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'manager', label: 'Manager' }
  ];

  const radioOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <GlassLayout>
        {/* Header */}
        <GlassCard variant="elevated" padding="lg" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={1}>🪟 Glass Design System Demo</GlassCardTitle>
            <GlassCardContent>
              Comprehensive showcase of all Glass UI components with beautiful glass morphism effects.
            </GlassCardContent>
          </GlassCardHeader>
        </GlassCard>

        {/* Breadcrumb - Using simple navigation instead */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && <span className="text-white/40">/</span>}
                <span className={item.active ? "text-white font-medium" : "text-white/60 hover:text-white"}>
                  {item.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Buttons Section */}
        <GlassCard variant="interactive" padding="lg" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Buttons</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4">
              <GlassButton variant="primary">Primary Button</GlassButton>
              <GlassButton variant="secondary">Secondary Button</GlassButton>
              <GlassButton variant="ghost">Ghost Button</GlassButton>
              <GlassButton variant="gradient">Gradient Button</GlassButton>
              <GlassButton variant="danger">Danger Button</GlassButton>
            </div>
            
            <div className="h-6" />
            
            <div className="flex flex-wrap gap-4">
              <GlassIconButton variant="primary" icon="❤️" label="Like" />
              <GlassIconButton variant="secondary" icon="📤" label="Share" />
              <GlassIconButton variant="accent" icon="⭐" label="Star" />
              <GlassIconButton variant="danger" icon="🗑️" label="Delete" />
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Forms Section */}
        <GlassCard variant="elevated" padding="lg" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Forms</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <GlassForm spacing="md">
              <GlassInput
                label="Name"
                placeholder="Enter your name"
                value={formData.name}
                onValueChange={(value) => handleInputChange('name', value)}
              />
              
              <GlassInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onValueChange={(value) => handleInputChange('email', value)}
              />
              
              <GlassSelect
                label="Role"
                placeholder="Select your role"
                options={selectOptions}
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              />
              
              <GlassCheckbox
                label="Subscribe to newsletter"
                checked={formData.newsletter}
                onChange={(e) => handleInputChange('newsletter', e.target.checked)}
              />
              
              <GlassRadio
                label="Gender"
                options={radioOptions}
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              />
              
              <GlassTextarea
                label="Message"
                placeholder="Enter your message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                autoResize
                maxLength={200}
                showCount
              />
            </GlassForm>
          </GlassCardContent>
        </GlassCard>

        {/* Layout Section */}
        <GlassCard variant="feature" padding="lg" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Layout System</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <GlassCard variant="basic" padding="md">
                <GlassCardContent>Grid Item 1</GlassCardContent>
              </GlassCard>
              <GlassCard variant="basic" padding="md">
                <GlassCardContent>Grid Item 2</GlassCardContent>
              </GlassCard>
              <GlassCard variant="basic" padding="md">
                <GlassCardContent>Grid Item 3</GlassCardContent>
              </GlassCard>
            </div>
            
            <div className="flex justify-between items-center gap-6">
              <GlassCard variant="basic" padding="sm">
                <GlassCardContent>Flex Item 1</GlassCardContent>
              </GlassCard>
              <div className="flex-1" />
              <GlassCard variant="basic" padding="sm">
                <GlassCardContent>Flex Item 2</GlassCardContent>
              </GlassCard>
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* Feedback Section */}
        <GlassCard variant="elevated" padding="lg" className="mb-8">
          <GlassCardHeader>
            <GlassCardTitle level={2}>Feedback Components</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <GlassButton 
                onClick={() => setShowToast(true)}
              >
                Show Toast
              </GlassButton>
              <GlassButton 
                variant="secondary"
                onClick={() => setShowAlert(!showAlert)}
              >
                Toggle Alert
              </GlassButton>
              <GlassButton 
                variant="ghost"
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </GlassButton>
            </div>
            
            {showAlert && (
              <GlassAlert
                type="success"
                title="Success!"
                message="This is a success alert with glass styling."
                dismissible
                onDismiss={() => setShowAlert(false)}
                className="mb-4"
              />
            )}
            
            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <GlassLoading type="spinner" size="lg" />
                <p className="glass-text-secondary text-sm mt-2">Spinner</p>
              </div>
              <div className="text-center">
                <GlassLoading type="dots" size="lg" />
                <p className="glass-text-secondary text-sm mt-2">Dots</p>
              </div>
              <div className="text-center">
                <GlassLoading type="pulse" size="lg" />
                <p className="glass-text-secondary text-sm mt-2">Pulse</p>
              </div>
            </div>
            
            <GlassLoading 
              type="progress" 
              text="Loading..." 
              progress={65} 
              className="mb-6" 
            />
            
            <GlassEmpty
              icon="📭"
              title="No data available"
              description="There are no items to display at the moment. Please check back later or add some content."
              action={
                <GlassButton variant="primary" size="sm">
                  Add Content
                </GlassButton>
              }
            />
          </GlassCardContent>
        </GlassCard>

        {/* Modal */}
        <GlassModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Glass Modal Demo"
          size="md"
        >
          <GlassCardContent>
            <p className="glass-text-secondary mb-4">
              This is a beautiful glass modal with backdrop blur effects and smooth animations.
            </p>
            <div className="flex gap-4 justify-end">
              <GlassButton 
                variant="secondary" 
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={() => setIsModalOpen(false)}
              >
                Confirm
              </GlassButton>
            </div>
          </GlassCardContent>
        </GlassModal>

        {/* Toast */}
        {showToast && (
          <GlassToast
            type="success"
            title="Success!"
            message="Glass toast notification with beautiful styling"
            onClose={() => setShowToast(false)}
            duration={3000}
          />
        )}

        {/* Floating Action Button */}
        <GlassFloatingButton
          variant="primary"
          icon="➕"
          label="Add Item"
          onClick={() => setShowToast(true)}
          pulse
        />
      </GlassLayout>
    </div>
  );
}

      </GlassLayout>
    </div>
  );
}

      </GlassLayout>
    </div>
  );
}
