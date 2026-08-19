export class Validators {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateRegistration(name: string, email: string, passwordHash: string): string | null {
    if (!name || name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (!email || !this.isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (!passwordHash || passwordHash.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(passwordHash)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(passwordHash)) {
      return 'Password must contain at least one lowercase letter';
    }
    return null;
  }

  static validateContactMessage(name: string, email: string, subject: string, message: string): string | null {
    if (!name || name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (!email || !this.isValidEmail(email)) {
      return 'Please enter a valid email address';
    }
    if (!subject || subject.trim().length < 3) {
      return 'Subject must be at least 3 characters';
    }
    if (!message || message.trim().length < 10) {
      return 'Message must be at least 10 characters';
    }
    return null;
  }

  static validateComment(comment: string): string | null {
    if (!comment || comment.trim().length < 2) {
      return 'Comment must be at least 2 characters long';
    }
    if (comment.length > 500) {
      return 'Comment cannot exceed 500 characters';
    }
    return null;
  }
}
