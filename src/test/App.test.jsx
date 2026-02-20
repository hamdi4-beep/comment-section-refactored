import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App Integration Tests', () => {
  describe('Initial Rendering', () => {
    it('should render initial comments from data', () => {
      render(<App />)
      expect(screen.getByText(/Impressive! Though it seems the drag feature/)).toBeInTheDocument()
      expect(screen.getByText(/Woah, your project looks awesome!/)).toBeInTheDocument()
    })

    it('should render comments sorted by score descending', () => {
      render(<App />)
      const scores = screen.getAllByText(/^\d+$/).map(el => parseInt(el.textContent))
      // First visible score should be the highest
      expect(scores[0]).toBe(12)
    })

    it('should render the main comment form', () => {
      render(<App />)
      expect(screen.getAllByPlaceholderText('Add a comment...').length).toBeGreaterThanOrEqual(1)
    })

    it('should render nested replies from initial data', () => {
      render(<App />)
      expect(screen.getByText(/If you're still new, I'd recommend focusing/)).toBeInTheDocument()
      expect(screen.getByText(/I couldn't agree more with this/)).toBeInTheDocument()
    })
  })

  describe('Creating Comments', () => {
    it('should add a new top-level comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const forms = screen.getAllByPlaceholderText('Add a comment...')
      await user.type(forms[forms.length - 1], 'Brand new comment')
      await user.click(screen.getAllByText('send').at(-1))

      expect(screen.getByText('Brand new comment')).toBeInTheDocument()
    })

    it('should display just now timestamp on new comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const forms = screen.getAllByPlaceholderText('Add a comment...')
      await user.type(forms[forms.length - 1], 'Timestamped comment')
      await user.click(screen.getAllByText('send').at(-1))

      expect(screen.getByText('just now')).toBeInTheDocument()
    })

    it('should display score of 0 on new comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const forms = screen.getAllByPlaceholderText('Add a comment...')
      await user.type(forms[forms.length - 1], 'Zero score comment')
      await user.click(screen.getAllByText('send').at(-1))

      const newComment = screen.getByText('Zero score comment').closest('.comment')
      expect(within(newComment).getByText('0')).toBeInTheDocument()
    })

    it('should not add a comment when textarea is empty', async () => {
      const user = userEvent.setup()
      render(<App />)

      const initialCount = screen.getAllByText(/ago$|just now/).length
      await user.click(screen.getAllByText('send').at(-1))

      expect(screen.getAllByText(/ago$|just now/).length).toBe(initialCount)
    })
  })

  describe('Replying', () => {
    it('should show reply form when Reply is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getAllByText('Reply')[0])

      expect(screen.getAllByPlaceholderText('Add a comment...').length).toBeGreaterThan(1)
    })

    it('should add a reply to a comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getAllByText('Reply')[0])
      await user.type(screen.getAllByPlaceholderText('Add a comment...')[0], 'My reply')
      await user.click(screen.getAllByText('send')[0])

      expect(screen.getByText('My reply')).toBeInTheDocument()
    })

    it('should display replyingTo mention in reply', async () => {
      const user = userEvent.setup()
      render(<App />)

      await user.click(screen.getAllByText('Reply')[0])
      await user.type(screen.getAllByPlaceholderText('Add a comment...')[0], 'Reply with mention')
      await user.click(screen.getAllByText('send')[0])

      expect(screen.getByText(/@\w+/, { selector: '.replying-to' })).toBeInTheDocument()
    })
  })

  describe('Editing', () => {
    it('should show edit form for current user comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const editButtons = screen.queryAllByText('Edit')
      if (editButtons.length === 0) return // skip if no current user comments visible

      await user.click(editButtons[0])
      expect(screen.getAllByPlaceholderText('Add a comment...').length).toBeGreaterThan(0)
    })

    it('should update comment content on edit submission', async () => {
      const user = userEvent.setup()
      render(<App />)

      const editButtons = screen.queryAllByText('Edit')
      if (editButtons.length === 0) return

      await user.click(editButtons[0])
      const textarea = screen.getAllByPlaceholderText('Add a comment...')[0]
      await user.clear(textarea)
      await user.type(textarea, 'Edited content')
      await user.click(screen.getAllByText('send')[0])

      expect(screen.getByText('Edited content')).toBeInTheDocument()
    })
  })

  describe('Deleting', () => {
    it('should show delete modal when Delete is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const deleteButtons = screen.queryAllByText('Delete')
      if (deleteButtons.length === 0) return

      await user.click(deleteButtons[0])
      expect(screen.getByText('Delete comment')).toBeInTheDocument()
    })

    it('should cancel deletion and keep comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const deleteButtons = screen.queryAllByText('Delete')
      if (deleteButtons.length === 0) return

      await user.click(deleteButtons[0])
      await user.click(screen.getByText('No, Cancel'))

      expect(screen.queryByText('Delete comment')).not.toBeInTheDocument()
    })

    it('should remove comment after confirming deletion', async () => {
      const user = userEvent.setup()
      render(<App />)

      const deleteButtons = screen.queryAllByText('Delete')
      if (deleteButtons.length === 0) return

      const commentEl = deleteButtons[0].closest('.comment')
      const contentText = commentEl.querySelector('p').textContent

      await user.click(deleteButtons[0])
      await user.click(screen.getByText('Yes, Delete'))

      expect(screen.queryByText(contentText)).not.toBeInTheDocument()
    })
  })

  describe('Voting', () => {
    it('should disable upvote button after clicking', async () => {
      const user = userEvent.setup()
      render(<App />)

      const upvoteBtn = screen.getAllByAltText('plus icon for upvoting')[0].closest('button')
      await user.click(upvoteBtn)

      expect(upvoteBtn).toBeDisabled()
    })

    it('should disable downvote button after clicking', async () => {
      const user = userEvent.setup()
      render(<App />)

      const downvoteBtn = screen.getAllByAltText('minus icon for downvoting')[0].closest('button')
      await user.click(downvoteBtn)

      expect(downvoteBtn).toBeDisabled()
    })
  })
})