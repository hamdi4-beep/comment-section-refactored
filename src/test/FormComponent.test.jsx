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

    it('should render current user avatar', () => {
      render(<FormComponent onSubmit={vi.fn()} />)
      const avatar = screen.getByRole('img', { hidden: true })
      expect(avatar).toHaveAttribute('src', expect.stringContaining('image-juliusomo.png'))
    })

    it('should render with empty textarea by default', () => {
      render(<FormComponent onSubmit={vi.fn()} />)
      expect(screen.getByPlaceholderText('Add a comment...')).toHaveValue('')
    })

    it('should render with provided value pre-filled', () => {
      render(<FormComponent value="Existing content" onSubmit={vi.fn()} />)
      expect(screen.getByPlaceholderText('Add a comment...')).toHaveValue('Existing content')
    })

    it('should autofocus the textarea', () => {
      render(<FormComponent onSubmit={vi.fn()} />)
      expect(screen.getByPlaceholderText('Add a comment...')).toHaveAttribute('autoFocus')
    })

    it('should have correct name and id on textarea', () => {
      render(<FormComponent onSubmit={vi.fn()} />)
      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toHaveAttribute('name', 'comment')
      expect(textarea).toHaveAttribute('id', 'comment')
    })
  })

  describe('Submission', () => {
    it('should call onSubmit with typed content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<FormComponent onSubmit={mockSubmit} />)

      await user.type(screen.getByPlaceholderText('Add a comment...'), 'Hello world')
      await user.click(screen.getByText('send'))

      expect(mockSubmit).toHaveBeenCalledWith('Hello world')
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    it('should not call onSubmit when textarea is empty', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<FormComponent onSubmit={mockSubmit} />)

      await user.click(screen.getByText('send'))

      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should call onSubmit with updated content in edit mode', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<FormComponent value="Original" onSubmit={mockSubmit} />)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.clear(textarea)
      await user.type(textarea, 'Updated')
      await user.click(screen.getByText('send'))

      expect(mockSubmit).toHaveBeenCalledWith('Updated')
    })

    it('should call onSubmit with appended content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<FormComponent value="Original" onSubmit={mockSubmit} />)

      await user.type(screen.getByPlaceholderText('Add a comment...'), ' appended')
      await user.click(screen.getByText('send'))

      expect(mockSubmit).toHaveBeenCalledWith('Original appended')
    })

    it('should not submit on Enter key in textarea', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<FormComponent onSubmit={mockSubmit} />)

      await user.type(screen.getByPlaceholderText('Add a comment...'), 'Test content')
      await user.keyboard('{Enter}')

      expect(mockSubmit).not.toHaveBeenCalled()
    })

    it('should handle special characters in content', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      render(<FormComponent onSubmit={mockSubmit} />)

      const content = 'Hello & <world> "test"'
      await user.type(screen.getByPlaceholderText('Add a comment...'), content)
      await user.click(screen.getByText('send'))

      expect(mockSubmit).toHaveBeenCalledWith(content)
    })
  })

  describe('Accessibility', () => {
    it('should have a form element wrapping the inputs', () => {
      render(<FormComponent onSubmit={vi.fn()} />)
      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea.closest('form')).toBeInTheDocument()
    })

    it('should have send button with cta class', () => {
      render(<FormComponent onSubmit={vi.fn()} />)
      expect(screen.getByText('send')).toHaveClass('cta')
    })
  })
})