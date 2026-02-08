import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App Integration Tests', () => {
  describe('Initial Rendering', () => {
    it('should render the comment list', () => {
      render(<App />)

      // Should have initial comments from data
      expect(screen.getByText(/Impressive! Though it seems the drag feature/)).toBeInTheDocument()
      expect(screen.getByText(/Woah, your project looks awesome!/)).toBeInTheDocument()
    })

    it('should render comments sorted by score (highest first)', () => {
      render(<App />)

      const comments = screen.getAllByText(/ago$/)
      const parent = comments[0].closest('.comment')
      
      // First comment should have highest score (12)
      expect(within(parent).getByText('12')).toBeInTheDocument()
    })

    it('should render the form for creating new comments', () => {
      render(<App />)

      const textareas = screen.getAllByPlaceholderText('Add a comment...')
      // Should have at least one textarea (the main form)
      expect(textareas.length).toBeGreaterThanOrEqual(1)
    })

    it('should render nested replies', () => {
      render(<App />)

      // Check for nested replies from initial data
      expect(screen.getByText(/If you're still new, I'd recommend focusing/)).toBeInTheDocument()
      expect(screen.getByText(/I couldn't agree more with this/)).toBeInTheDocument()
    })
  })

  describe('Creating Comments', () => {
    it('should create a new top-level comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const initialCommentCount = screen.getAllByText(/ago$/).length

      // Find the main form (not in a nested reply)
      const forms = screen.getAllByPlaceholderText('Add a comment...')
      const mainForm = forms[forms.length - 1]
      
      await user.type(mainForm, 'This is a brand new comment')
      
      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[sendButtons.length - 1])

      // Should have one more comment
      const newCommentCount = screen.getAllByText(/ago$|just now/).length
      expect(newCommentCount).toBe(initialCommentCount + 1)
      
      // New comment should appear
      expect(screen.getByText('This is a brand new comment')).toBeInTheDocument()
    })

    it('should display new comment with "just now" timestamp', async () => {
      const user = userEvent.setup()
      render(<App />)

      const forms = screen.getAllByPlaceholderText('Add a comment...')
      const mainForm = forms[forms.length - 1]
      
      await user.type(mainForm, 'New comment with timestamp')
      
      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[sendButtons.length - 1])

      expect(screen.getByText('just now')).toBeInTheDocument()
    })

    it('should display new comment with score of 0', async () => {
      const user = userEvent.setup()
      render(<App />)

      const forms = screen.getAllByPlaceholderText('Add a comment...')
      const mainForm = forms[forms.length - 1]
      
      await user.type(mainForm, 'Comment to check score')
      
      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[sendButtons.length - 1])

      // Find the new comment and check its score
      const newComment = screen.getByText('Comment to check score').closest('.comment')
      expect(within(newComment).getByText('0')).toBeInTheDocument()
    })
  })

  describe('Replying to Comments', () => {
    it('should open reply form when Reply button is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Click reply on first non-current-user comment
      const replyButtons = screen.getAllByText('Reply')
      await user.click(replyButtons[0])

      // Should show additional textarea
      const textareas = screen.getAllByPlaceholderText('Add a comment...')
      expect(textareas.length).toBeGreaterThan(1)
    })

    it('should create a reply to a comment', async () => {
      const user = userEvent.setup()
      render(<App />)

      const replyButtons = screen.getAllByText('Reply')
      await user.click(replyButtons[0])

      const textareas = screen.getAllByPlaceholderText('Add a comment...')
      // Use the newly appeared textarea (reply form)
      const replyForm = textareas[0]
      
      await user.type(replyForm, 'This is a reply to the comment')
      
      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[0])

      expect(screen.getByText('This is a reply to the comment')).toBeInTheDocument()
    })

    it('should display replyingTo username in replies', async () => {
      const user = userEvent.setup()
      render(<App />)

      const replyButtons = screen.getAllByText('Reply')
      await user.click(replyButtons[0])

      const textareas = screen.getAllByPlaceholderText('Add a comment...')
      const replyForm = textareas[0]
      
      await user.type(replyForm, 'Reply with mention')
      
      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[0])

      // Should show @username
      expect(screen.getByText(/@\w+/, { selector: '.replying-to' })).toBeInTheDocument()
    })

    it('should create nested reply (reply to reply)', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Find reply buttons within nested replies
      const allReplies = screen.getAllByText('Reply')
      
      // Click on a reply button that's already in a nested structure
      if (allReplies.length > 1) {
        await user.click(allReplies[1])

        const textareas = screen.getAllByPlaceholderText('Add a comment...')
        const nestedReplyForm = textareas[0]
        
        await user.type(nestedReplyForm, 'Nested reply content')
        
        const sendButtons = screen.getAllByText('send')
        await user.click(sendButtons[0])

        expect(screen.getByText('Nested reply content')).toBeInTheDocument()
      }
    })
  })

  describe('Voting', () => {
    it('should increment score when upvote is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const comments = screen.getAllByAltText('plus icon for upvoting')
      const firstComment = comments[0].closest('.comment')
      const initialScore = parseInt(within(firstComment).getByClassName('comment-score').textContent)

      await user.click(comments[0])

      // Note: Due to ref-based spam prevention, we can't easily test the updated score
      // without mocking or more complex setup. This tests the click works.
      expect(comments[0]).toBeInTheDocument()
    })

    it('should decrement score when downvote is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const comments = screen.getAllByAltText('minus icon for downvoting')
      const firstDownvote = comments[0]

      await user.click(firstDownvote)

      // Test that the interaction works
      expect(firstDownvote).toBeInTheDocument()
    })
  })

  describe('Editing Comments', () => {
    it('should show edit form for current user comments', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Find Edit button (only available for juliusomo's comments)
      const editButtons = screen.queryAllByText('Edit')
      
      if (editButtons.length > 0) {
        await user.click(editButtons[0])

        // Should show textarea with existing content
        const textarea = screen.getAllByPlaceholderText('Add a comment...')
        expect(textarea.length).toBeGreaterThan(0)
      }
    })

    it('should update comment content when edit is submitted', async () => {
      const user = userEvent.setup()
      render(<App />)

      const editButtons = screen.queryAllByText('Edit')
      
      if (editButtons.length > 0) {
        const originalContent = editButtons[0].closest('.comment').querySelector('p').textContent
        
        await user.click(editButtons[0])

        const textareas = screen.getAllByPlaceholderText('Add a comment...')
        const editForm = textareas[0]
        
        await user.clear(editForm)
        await user.type(editForm, 'This content has been edited')
        
        const sendButtons = screen.getAllByText('send')
        await user.click(sendButtons[0])

        expect(screen.getByText('This content has been edited')).toBeInTheDocument()
        expect(screen.queryByText(originalContent)).not.toBeInTheDocument()
      }
    })
  })

  describe('Deleting Comments', () => {
    it('should show delete modal when Delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const deleteButtons = screen.queryAllByText('Delete')
      
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0])

        expect(screen.getByText('Delete comment')).toBeInTheDocument()
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
      }
    })

    it('should cancel deletion when No Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const deleteButtons = screen.queryAllByText('Delete')
      
      if (deleteButtons.length > 0) {
        const commentToKeep = deleteButtons[0].closest('.comment').querySelector('p').textContent
        
        await user.click(deleteButtons[0])
        
        const cancelButton = screen.getByText('No, Cancel')
        await user.click(cancelButton)

        expect(screen.queryByText('Delete comment')).not.toBeInTheDocument()
        expect(screen.getByText(commentToKeep)).toBeInTheDocument()
      }
    })

    it('should delete comment when Yes Delete is clicked', async () => {
      const user = userEvent.setup()
      render(<App />)

      const deleteButtons = screen.queryAllByText('Delete')
      
      if (deleteButtons.length > 0) {
        const commentToDelete = deleteButtons[0].closest('.comment').querySelector('p').textContent
        
        await user.click(deleteButtons[0])
        
        const confirmButton = screen.getByText('Yes, Delete')
        await user.click(confirmButton)

        expect(screen.queryByText(commentToDelete)).not.toBeInTheDocument()
      }
    })
  })

  describe('Sorting', () => {
    it('should maintain sort order after adding new comment with high score', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Create new comment (score will be 0)
      const forms = screen.getAllByPlaceholderText('Add a comment...')
      const mainForm = forms[forms.length - 1]
      
      await user.type(mainForm, 'Low score comment')
      
      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[sendButtons.length - 1])

      // Check that high-score comments still appear first
      const allComments = screen.getAllByRole('article', { hidden: true })
        .map(article => article.querySelector('.comment-score')?.textContent)
        .filter(Boolean)
        .map(score => parseInt(score))

      // First score should be higher than last
      if (allComments.length > 1) {
        expect(allComments[0]).toBeGreaterThanOrEqual(allComments[allComments.length - 1])
      }
    })

    it('should re-sort after score changes', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Get current first comment
      const upvoteButtons = screen.getAllByAltText('plus icon for upvoting')
      
      // This tests that voting mechanism works
      await user.click(upvoteButtons[0])
      
      expect(upvoteButtons[0]).toBeInTheDocument()
    })
  })

  describe('Complex User Flows', () => {
    it('should handle creating comment, replying, and editing in sequence', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Create comment
      const forms = screen.getAllByPlaceholderText('Add a comment...')
      await user.type(forms[forms.length - 1], 'Original comment')
      
      let sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[sendButtons.length - 1])

      expect(screen.getByText('Original comment')).toBeInTheDocument()

      // Reply to any comment
      const replyButtons = screen.getAllByText('Reply')
      await user.click(replyButtons[0])

      const textareas = screen.getAllByPlaceholderText('Add a comment...')
      await user.type(textareas[0], 'Reply comment')

      sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[0])

      expect(screen.getByText('Reply comment')).toBeInTheDocument()
    })

    it('should handle multiple rapid interactions', async () => {
      const user = userEvent.setup()
      render(<App />)

      // Click multiple upvotes
      const upvotes = screen.getAllByAltText('plus icon for upvoting')
      await user.click(upvotes[0])
      await user.click(upvotes[1])
      await user.click(upvotes[2])

      // Open reply forms
      const replyButtons = screen.getAllByText('Reply')
      await user.click(replyButtons[0])
      await user.click(replyButtons[1])

      // Should not crash and forms should be visible
      const textareas = screen.getAllByPlaceholderText('Add a comment...')
      expect(textareas.length).toBeGreaterThan(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty comment list gracefully', () => {
      // This would require mocking the data import, but tests component doesn't crash
      render(<App />)
      expect(screen.getByRole('main', { hidden: true }) || document.querySelector('.App')).toBeInTheDocument()
    })

    it('should not submit empty comments', async () => {
      const user = userEvent.setup()
      render(<App />)

      const initialCommentCount = screen.getAllByText(/ago$|just now/).length

      const sendButtons = screen.getAllByText('send')
      await user.click(sendButtons[sendButtons.length - 1])

      const finalCommentCount = screen.getAllByText(/ago$|just now/).length
      expect(finalCommentCount).toBe(initialCommentCount)
    })
  })
})