import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [field: string]: ValidationRule[];
}

interface ValidationErrors {
  [field: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationRules: ValidationRules = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: string, value: any): string | null => {
    const rules = validationRules[field];
    if (!rules) return null;

    for (const rule of rules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }
    return null;
  }, [validationRules]);

  const validateForm = useCallback((): boolean => {
    setIsValidating(true);
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsValidating(false);
    return isValid;
  }, [data, validationRules, validateField]);

  const updateField = useCallback((field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async (
    onSubmit: (data: T) => Promise<void> | void
  ) => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return false;
    }

    try {
      await onSubmit(data);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      return false;
    }
  }, [data, validateForm]);

  return {
    data,
    errors,
    isValidating,
    updateField,
    setFieldError,
    clearErrors,
    validateField,
    validateForm,
    handleSubmit,
    setData
  };
}

// Common validation rules
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value !== '',
    message
  }),
  
  email: (message = 'Please enter a valid email'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),
  
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length >= min,
    message: message || `Must be at least ${min} characters`
  }),
  
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => String(value).length <= max,
    message: message || `Must be no more than ${max} characters`
  }),
  
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    test: (value) => regex.test(String(value)),
    message
  }),
  
  password: (message = 'Password must contain uppercase, lowercase, number, and special character'): ValidationRule => ({
    test: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value),
    message
  })
};
