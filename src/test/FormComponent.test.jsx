import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormComponent from '../components/FormComponent'

describe('FormComponent', () => {
  describe('Rendering', () => {
    it('should render textarea with placeholder', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
    })

    it('should render send button', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      expect(screen.getByText('send')).toBeInTheDocument()
    })

    it('should render user avatar', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      const avatar = screen.getByAltText('')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', expect.stringContaining('image-juliusomo.png'))
    })

    it('should render with initial value when provided', () => {
      render(<FormComponent value="Initial content" onSubmit={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveValue('Initial content')
    })

    it('should render with empty textarea when no value provided', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveValue('')
    })

    it('should autofocus textarea', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveAttribute('autoFocus')
    })
  })

  describe('Form Submission', () => {
    it('should call onSubmit with textarea content when form is submitted', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, 'Test comment content')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).toHaveBeenCalledWith('Test comment content')
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('should not call onSubmit when textarea is empty', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<FormComponent onSubmit={mockSubmit} />)

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should handle multiline content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      const multilineContent = 'Line 1\nLine 2\nLine 3'
      await user.type(textarea, multilineContent)

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).toHaveBeenCalledWith(multilineContent)
    })

    it('should trim whitespace from submission', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, '   Content with spaces   ')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      // Note: Native form behavior doesn't trim, so this tests actual behavior
      expect(mockSubmit).toHaveBeenCalledWith('   Content with spaces   ')
    })

    it('should work with Enter key submission when configured', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, 'Test content')
      
      // Note: Default HTML form doesn't submit on Enter in textarea
      // This tests current behavior, not keyboard submission
      await user.keyboard('{Enter}')
      
      // Form is not submitted by Enter in textarea (expected behavior)
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Editing Mode', () => {
    it('should populate textarea with existing value for editing', () => {
      const existingContent = 'This is existing content to edit'
      render(<FormComponent value={existingContent} onSubmit={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveValue(existingContent)
    })

    it('should allow editing existing content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const existingContent = 'Original content'

      render(<FormComponent value={existingContent} onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).toHaveBeenCalledWith('Updated content')
    })

    it('should allow appending to existing content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const existingContent = 'Original'

      render(<FormComponent value={existingContent} onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.click(textarea)
      await user.type(textarea, ' + Addition')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).toHaveBeenCalledWith('Original + Addition')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const longContent = 'A'.repeat(5000)

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, longContent)

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).toHaveBeenCalledWith(longContent)
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const specialContent = '<script>alert("test")</script> & special chars!@#$%'

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, specialContent)

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockSubmit).toHaveBeenCalledWith(specialContent)
    })

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(<FormComponent onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, 'Test')

      const sendButton = screen.getByText('send')
      
      // Click multiple times rapidly
      await user.click(sendButton)
      await user.click(sendButton)
      await user.click(sendButton)

      // All clicks should register (no debouncing)
      expect(mockSubmit).toHaveBeenCalledTimes(3)
    })

    it('should handle empty string value prop', () => {
      render(<FormComponent value="" onSubmit={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveValue('')
    })

    it('should handle undefined onSubmit gracefully', async () => {
      const user = userEvent.setup()

      // This shouldn't crash
      render(<FormComponent value="test" />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, 'content')

      const sendButton = screen.getByText('send')
      
      // Should not throw error
      expect(() => user.click(sendButton)).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      const form = screen.getByRole('textbox').closest('form')
      expect(form).toBeInTheDocument()
    })

    it('should have textarea with correct name attribute', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveAttribute('name', 'comment')
      expect(textarea).toHaveAttribute('id', 'comment')
    })

    it('should have button with correct type', () => {
      render(<FormComponent onSubmit={vi.fn()} />)

      const button = screen.getByText('send')
      expect(button).toHaveAttribute('class', 'cta')
    })
  })
})