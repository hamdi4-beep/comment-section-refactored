import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Comment from '../components/Comment'

describe('Comment Component', () => {
  const mockActions = {
    createComment: vi.fn(),
    createReply: vi.fn(),
    deleteComment: vi.fn(),
    editComment: vi.fn(),
    updateScore: vi.fn()
  }

  const mockComment = {
    parentId: null,
    id: '1',
    content: 'This is a test comment',
    createdAt: '1 week ago',
    score: 5,
    replyingTo: null,
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
      render(<Comment comment={mockComment} actions={mockActions} />)
      expect(screen.getByText('This is a test comment')).toBeInTheDocument()
    })

    it('should render username and date', () => {
      render(<Comment comment={mockComment} actions={mockActions} />)
      expect(screen.getByText('testuser')).toBeInTheDocument()
      expect(screen.getByText('1 week ago')).toBeInTheDocument()
    })

    it('should render score', () => {
      render(<Comment comment={mockComment} actions={mockActions} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render replyingTo mention for replies', () => {
      const reply = { ...mockComment, replyingTo: 'originaluser' }
      render(<Comment comment={reply} actions={mockActions} />)
      expect(screen.getByText('@originaluser', { exact: false })).toBeInTheDocument()
    })

    it('should not render replyingTo mention for top-level comments', () => {
      render(<Comment comment={mockComment} actions={mockActions} />)
      expect(screen.queryByText(/@\w+/)).not.toBeInTheDocument()
    })

    it('should render nested replies recursively', () => {
      const commentWithReplies = {
        ...mockComment,
        replies: [
          {
            parentId: '1',
            id: '1-1',
            content: 'First reply',
            createdAt: '2 days ago',
            score: 2,
            replyingTo: 'testuser',
            user: {
              username: 'replier1',
              image: { png: '/img1.png', webp: '/img1.webp' }
            },
            replies: null
          }
        ]
      }

      render(<Comment comment={commentWithReplies} actions={mockActions} />)
      expect(screen.getByText('First reply')).toBeInTheDocument()
      expect(screen.getByText('replier1')).toBeInTheDocument()
    })
  })

  describe('User Permissions', () => {
    it('should show Reply button for non-current-user comments', () => {
      render(<Comment comment={mockComment} actions={mockActions} />)
      expect(screen.getByText('Reply')).toBeInTheDocument()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('should show Edit and Delete buttons for current user comments', () => {
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.queryByText('Reply')).not.toBeInTheDocument()
    })
  })

  describe('Voting', () => {
    it('should call updateScore with +1 when upvote is clicked', () => {
      render(<Comment comment={mockComment} actions={mockActions} />)
      const upvoteButton = screen.getByAltText('plus icon for upvoting').closest('button')
      fireEvent.click(upvoteButton)
      expect(mockActions.updateScore).toHaveBeenCalledWith(null, '1', 5, +1)
    })

    it('should call updateScore with -1 when downvote is clicked', () => {
      render(<Comment comment={mockComment} actions={mockActions} />)
      const downvoteButton = screen.getByAltText('minus icon for downvoting').closest('button')
      fireEvent.click(downvoteButton)
      expect(mockActions.updateScore).toHaveBeenCalledWith(null, '1', 5, -1)
    })

    it('should disable upvote button after clicking it', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      const upvoteButton = screen.getByAltText('plus icon for upvoting').closest('button')
      await user.click(upvoteButton)
      expect(upvoteButton).toBeDisabled()
    })

    it('should disable downvote button after clicking it', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      const downvoteButton = screen.getByAltText('minus icon for downvoting').closest('button')
      await user.click(downvoteButton)
      expect(downvoteButton).toBeDisabled()
    })

    it('should not allow voting in the same direction twice', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      const upvoteButton = screen.getByAltText('plus icon for upvoting').closest('button')
      await user.click(upvoteButton)
      await user.click(upvoteButton) // disabled, should not fire
      expect(mockActions.updateScore).toHaveBeenCalledTimes(1)
    })

    it('should re-enable upvote after downvoting', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      const upvoteButton = screen.getByAltText('plus icon for upvoting').closest('button')
      const downvoteButton = screen.getByAltText('minus icon for downvoting').closest('button')
      await user.click(upvoteButton)
      expect(upvoteButton).toBeDisabled()
      await user.click(downvoteButton)
      expect(upvoteButton).not.toBeDisabled()
    })
  })

  describe('Reply Functionality', () => {
    it('should show reply form when Reply is clicked', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      await user.click(screen.getByText('Reply'))
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
    })

    it('should toggle reply form on repeated clicks', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      await user.click(screen.getByText('Reply'))
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
      await user.click(screen.getByText('Reply'))
      expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument()
    })

    it('should call createReply with correct args when submitted', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockComment} actions={mockActions} />)
      await user.click(screen.getByText('Reply'))
      await user.type(screen.getByPlaceholderText('Add a comment...'), 'My reply')
      await user.click(screen.getByText('send'))
      expect(mockActions.createReply).toHaveBeenCalledWith(
        null, '1', 'testuser', 'My reply'
      )
    })

    it('should pass parentId when replying to a nested comment', async () => {
      const user = userEvent.setup()
      const nestedComment = {
        ...mockComment,
        id: 'nested-1',
        parentId: 'parent-1',
        replyingTo: 'testuser'
      }
      render(<Comment comment={nestedComment} actions={mockActions} />)
      await user.click(screen.getByText('Reply'))
      await user.type(screen.getByPlaceholderText('Add a comment...'), 'Nested reply')
      await user.click(screen.getByText('send'))
      expect(mockActions.createReply).toHaveBeenCalledWith(
        'parent-1', 'nested-1', 'testuser', 'Nested reply'
      )
    })
  })

  describe('Edit Functionality', () => {
    it('should show edit form pre-populated with existing content', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Edit'))
      expect(screen.getByPlaceholderText('Add a comment...')).toHaveValue(mockCurrentUserComment.content)
    })

    it('should toggle edit form on repeated clicks', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Edit'))
      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument()
      await user.click(screen.getByText('Edit'))
      expect(screen.queryByPlaceholderText('Add a comment...')).not.toBeInTheDocument()
    })

    it('should call editComment with correct args when submitted', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Edit'))
      const textarea = screen.getByPlaceholderText('Add a comment...')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')
      await user.click(screen.getByText('send'))
      expect(mockActions.editComment).toHaveBeenCalledWith(null, '2', 'Updated content')
    })
  })

  describe('Delete Functionality', () => {
    it('should show delete modal when Delete is clicked', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Delete'))
      expect(screen.getByText('Delete comment')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument()
    })

    it('should hide modal when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Delete'))
      await user.click(screen.getByText('No, Cancel'))
      expect(screen.queryByText('Delete comment')).not.toBeInTheDocument()
    })

    it('should call deleteComment with correct args when confirmed', async () => {
      const user = userEvent.setup()
      render(<Comment comment={mockCurrentUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Delete'))
      await user.click(screen.getByText('Yes, Delete'))
      expect(mockActions.deleteComment).toHaveBeenCalledWith(null, '2')
    })

    it('should pass parentId when deleting a nested comment', async () => {
      const user = userEvent.setup()
      const nestedUserComment = {
        ...mockCurrentUserComment,
        id: 'nested-2',
        parentId: 'parent-1'
      }
      render(<Comment comment={nestedUserComment} actions={mockActions} />)
      await user.click(screen.getByText('Delete'))
      await user.click(screen.getByText('Yes, Delete'))
      expect(mockActions.deleteComment).toHaveBeenCalledWith('parent-1', 'nested-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero score', () => {
      render(<Comment comment={{ ...mockComment, score: 0 }} actions={mockActions} />)
      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle negative score', () => {
      render(<Comment comment={{ ...mockComment, score: -3 }} actions={mockActions} />)
      expect(screen.getByText('-3')).toBeInTheDocument()
    })

    it('should render when replies is null', () => {
      render(<Comment comment={{ ...mockComment, replies: null }} actions={mockActions} />)
      expect(screen.getByText('This is a test comment')).toBeInTheDocument()
    })
  })
})