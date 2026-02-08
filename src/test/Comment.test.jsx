import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Comment from '../components/Comment'

describe('Comment Component', () => {
  const mockCommentActions = {
    createReply: vi.fn(),
    deleteComment: vi.fn(),
    incrementScore: vi.fn(),
    decrementScore: vi.fn(),
    updateContent: vi.fn()
  }

  const mockComment = {
    id: '1',
    content: 'This is a test comment',
    createdAt: '1 week ago',
    score: 5,
    user: {
      username: 'testuser',
      image: {
        png: '/images/avatars/image-testuser.png',
        webp: '/images/avatars/image-testuser.webp'
      }
    },
    replies: []
  }

  const mockCurrentUserComment = {
    ...mockComment,
    id: '2',
    user: {
      username: 'juliusomo',
      image: {
        png: '/images/avatars/image-juliusomo.png',
        webp: '/images/avatars/image-juliusomo.webp'
      }
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render comment content', () => {
      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('This is a test comment')).toBeInTheDocument()
    })

    it('should render user information', () => {
      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('testuser')).toBeInTheDocument()
      expect(screen.getByText('1 week ago')).toBeInTheDocument()
      expect(screen.getByAltText('user avatar')).toHaveAttribute('src', expect.stringContaining('image-testuser.png'))
    })

    it('should render score', () => {
      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render replyingTo username for replies', () => {
      const replyComment = {
        ...mockComment,
        replyingTo: 'originaluser'
      }

      render(
        <Comment
          comment={replyComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('@originaluser', { exact: false })).toBeInTheDocument()
    })

    it('should render nested replies recursively', () => {
      const commentWithReplies = {
        ...mockComment,
        replies: [
          {
            id: '1-1',
            content: 'First reply',
            createdAt: '2 days ago',
            score: 2,
            replyingTo: 'testuser',
            user: {
              username: 'replier1',
              image: { png: '/img1.png', webp: '/img1.webp' }
            }
          },
          {
            id: '1-2',
            content: 'Second reply',
            createdAt: '1 day ago',
            score: 1,
            replyingTo: 'testuser',
            user: {
              username: 'replier2',
              image: { png: '/img2.png', webp: '/img2.webp' }
            }
          }
        ]
      }

      render(
        <Comment
          comment={commentWithReplies}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('First reply')).toBeInTheDocument()
      expect(screen.getByText('Second reply')).toBeInTheDocument()
      expect(screen.getByText('replier1')).toBeInTheDocument()
      expect(screen.getByText('replier2')).toBeInTheDocument()
    })
  })

  describe('User Permissions', () => {
    it('should show Reply button for non-current user comments', () => {
      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('Reply')).toBeInTheDocument()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('should show Edit and Delete buttons for current user comments', () => {
      render(
        <Comment
          comment={mockCurrentUserComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.queryByText('Reply')).not.toBeInTheDocument()
    })
  })

  describe('Voting', () => {
    it('should call incrementScore when upvote button is clicked', () => {
      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const upvoteButton = screen.getByAltText('plus icon for upvoting').closest('button')
      fireEvent.click(upvoteButton)

      expect(mockCommentActions.incrementScore).toHaveBeenCalledWith(mockComment, 5)
    })

    it('should call decrementScore when downvote button is clicked', () => {
      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const downvoteButton = screen.getByAltText('minus icon for downvoting').closest('button')
      fireEvent.click(downvoteButton)

      expect(mockCommentActions.decrementScore).toHaveBeenCalledWith(mockComment, 5)
    })
  })

  describe('Reply Functionality', () => {
    it('should show reply form when Reply button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const replyButton = screen.getByText('Reply')
      await user.click(replyButton)

      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
    })

    it('should hide reply form when Reply button is clicked again', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const replyButton = screen.getByText('Reply')
      await user.click(replyButton)
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()

      await user.click(replyButton)
      expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument()
    })

    it('should call createReply when reply form is submitted', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const replyButton = screen.getByText('Reply')
      await user.click(replyButton)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, 'This is my reply')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockCommentActions.createReply).toHaveBeenCalledWith(
        mockComment,
        null,
        'This is my reply'
      )
    })

    it('should pass parentComment when replying to a nested comment', async () => {
      const user = userEvent.setup()
      const parentComment = { ...mockComment, id: 'parent-1' }
      const nestedComment = { ...mockComment, id: 'nested-1', replyingTo: 'testuser' }

      render(
        <Comment
          comment={nestedComment}
          parentComment={parentComment}
          commentActions={mockCommentActions}
        />
      )

      const replyButton = screen.getByText('Reply')
      await user.click(replyButton)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.type(textarea, 'Nested reply')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockCommentActions.createReply).toHaveBeenCalledWith(
        nestedComment,
        parentComment,
        'Nested reply'
      )
    })
  })

  describe('Edit Functionality', () => {
    it('should show edit form when Edit button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockCurrentUserComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      expect(textarea).toBeInTheDocument()
      expect(textarea).toHaveValue(mockCurrentUserComment.content)
    })

    it('should call updateContent when edit form is submitted', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockCurrentUserComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockCommentActions.updateContent).toHaveBeenCalledWith(
        mockCurrentUserComment,
        'Updated content'
      )
    })
  })

  describe('Delete Functionality', () => {
    it('should show delete modal when Delete button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockCurrentUserComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      expect(screen.getByText('Delete comment')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete this comment/)).toBeInTheDocument()
      expect(screen.getByText('No, Cancel')).toBeInTheDocument()
      expect(screen.getByText('Yes, Delete')).toBeInTheDocument()
    })

    it('should hide modal when Cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockCurrentUserComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      const cancelButton = screen.getByText('No, Cancel')
      await user.click(cancelButton)

      expect(screen.queryByText('Delete comment')).not.toBeInTheDocument()
    })

    it('should call deleteComment when Yes Delete is clicked', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockCurrentUserComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      const confirmButton = screen.getByText('Yes, Delete')
      await user.click(confirmButton)

      expect(mockCommentActions.deleteComment).toHaveBeenCalledWith(
        mockCurrentUserComment,
        null
      )
    })

    it('should pass parentComment when deleting a nested comment', async () => {
      const user = userEvent.setup()
      const parentComment = { ...mockComment, id: 'parent-1' }
      const nestedUserComment = {
        ...mockCurrentUserComment,
        id: 'nested-1',
        replyingTo: 'testuser'
      }

      render(
        <Comment
          comment={nestedUserComment}
          parentComment={parentComment}
          commentActions={mockCommentActions}
        />
      )

      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      const confirmButton = screen.getByText('Yes, Delete')
      await user.click(confirmButton)

      expect(mockCommentActions.deleteComment).toHaveBeenCalledWith(
        nestedUserComment,
        parentComment
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle comments with zero score', () => {
      const zeroScoreComment = { ...mockComment, score: 0 }

      render(
        <Comment
          comment={zeroScoreComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle comments with negative score', () => {
      const negativeScoreComment = { ...mockComment, score: -5 }

      render(
        <Comment
          comment={negativeScoreComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText('-5')).toBeInTheDocument()
    })

    it('should handle long comment content', () => {
      const longContent = 'A'.repeat(1000)
      const longComment = { ...mockComment, content: longContent }

      render(
        <Comment
          comment={longComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      expect(screen.getByText(longContent)).toBeInTheDocument()
    })

    it('should not submit empty reply', async () => {
      const user = userEvent.setup()

      render(
        <Comment
          comment={mockComment}
          parentComment={null}
          commentActions={mockCommentActions}
        />
      )

      const replyButton = screen.getByText('Reply')
      await user.click(replyButton)

      const sendButton = screen.getByText('send')
      await user.click(sendButton)

      expect(mockCommentActions.createReply).not.toHaveBeenCalled()
    })
  })
})