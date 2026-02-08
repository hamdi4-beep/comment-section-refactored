import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useComments } from '../hooks'

describe('useComments Hook', () => {
  const mockData = [
    {
      id: '1',
      content: 'First comment',
      createdAt: '1 month ago',
      score: 5,
      user: { username: 'user1', image: { png: '/img1.png', webp: '/img1.webp' } },
      replies: []
    },
    {
      id: '2',
      content: 'Second comment',
      createdAt: '2 weeks ago',
      score: 3,
      user: { username: 'user2', image: { png: '/img2.png', webp: '/img2.webp' } },
      replies: [
        {
          id: '2-1',
          content: 'Reply to second',
          createdAt: '1 week ago',
          score: 1,
          replyingTo: 'user2',
          user: { username: 'user3', image: { png: '/img3.png', webp: '/img3.webp' } }
        }
      ]
    }
  ]

  let result

  beforeEach(() => {
    const { result: hookResult } = renderHook(() => useComments(mockData))
    result = hookResult
  })

  describe('createComment', () => {
    it('should add a new top-level comment', () => {
      const initialLength = result.current.comments.length

      act(() => {
        result.current.commentActions.createComment('New comment content')
      })

      expect(result.current.comments).toHaveLength(initialLength + 1)
      
      const newComment = result.current.comments[result.current.comments.length - 1]
      expect(newComment.content).toBe('New comment content')
      expect(newComment.score).toBe(0)
      expect(newComment.user.username).toBe('juliusomo')
      expect(newComment.createdAt).toBe('just now')
      expect(newComment.replies).toEqual([])
      expect(newComment.id).toBeDefined()
    })

    it('should generate unique IDs for new comments', () => {
      act(() => {
        result.current.commentActions.createComment('Comment 1')
        result.current.commentActions.createComment('Comment 2')
      })

      const comments = result.current.comments
      const ids = comments.map(c => c.id)
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(ids.length)
    })
  })

  describe('createReply', () => {
    it('should add a reply to a top-level comment', () => {
      const targetComment = result.current.comments[0]
      const initialRepliesLength = targetComment.replies.length

      act(() => {
        result.current.commentActions.createReply(
          targetComment,
          null,
          'This is a reply'
        )
      })

      const updatedComment = result.current.comments.find(c => c.id === targetComment.id)
      expect(updatedComment.replies).toHaveLength(initialRepliesLength + 1)
      
      const newReply = updatedComment.replies[updatedComment.replies.length - 1]
      expect(newReply.content).toBe('This is a reply')
      expect(newReply.replyingTo).toBe(targetComment.user.username)
      expect(newReply.score).toBe(0)
      expect(newReply.createdAt).toBe('just now')
    })

    it('should add a reply to a nested comment (reply to reply)', () => {
      const parentComment = result.current.comments[1]
      const targetReply = parentComment.replies[0]

      act(() => {
        result.current.commentActions.createReply(
          targetReply,
          parentComment,
          'Reply to nested comment'
        )
      })

      const updatedParent = result.current.comments.find(c => c.id === parentComment.id)
      expect(updatedParent.replies).toHaveLength(2)
      
      const newReply = updatedParent.replies[updatedParent.replies.length - 1]
      expect(newReply.content).toBe('Reply to nested comment')
      expect(newReply.replyingTo).toBe(targetReply.user.username)
    })

    it('should maintain immutability when adding replies', () => {
      const targetComment = result.current.comments[0]
      const originalReplies = targetComment.replies

      act(() => {
        result.current.commentActions.createReply(
          targetComment,
          null,
          'New reply'
        )
      })

      // Original array should not be mutated
      expect(originalReplies).toEqual([])
    })
  })

  describe('deleteComment', () => {
    it('should delete a top-level comment', () => {
      const commentToDelete = result.current.comments[0]
      const initialLength = result.current.comments.length

      act(() => {
        result.current.commentActions.deleteComment(commentToDelete, null)
      })

      expect(result.current.comments).toHaveLength(initialLength - 1)
      expect(result.current.comments.find(c => c.id === commentToDelete.id)).toBeUndefined()
    })

    it('should delete a reply from a parent comment', () => {
      const parentComment = result.current.comments[1]
      const replyToDelete = parentComment.replies[0]
      const initialRepliesLength = parentComment.replies.length

      act(() => {
        result.current.commentActions.deleteComment(replyToDelete, parentComment)
      })

      const updatedParent = result.current.comments.find(c => c.id === parentComment.id)
      expect(updatedParent.replies).toHaveLength(initialRepliesLength - 1)
      expect(updatedParent.replies.find(r => r.id === replyToDelete.id)).toBeUndefined()
    })

    it('should maintain other comments when deleting one', () => {
      const commentToDelete = result.current.comments[0]
      const commentToKeep = result.current.comments[1]

      act(() => {
        result.current.commentActions.deleteComment(commentToDelete, null)
      })

      expect(result.current.comments.find(c => c.id === commentToKeep.id)).toBeDefined()
    })
  })

  describe('incrementScore', () => {
    it('should increment score when current score matches', () => {
      const comment = result.current.comments[0]
      const initialScore = comment.score

      act(() => {
        result.current.commentActions.incrementScore(comment, initialScore)
      })

      const updatedComment = result.current.comments.find(c => c.id === comment.id)
      expect(updatedComment.score).toBe(initialScore + 1)
    })

    it('should not increment score when current score is greater (spam prevention)', () => {
      const comment = result.current.comments[0]
      const initialScore = comment.score

      act(() => {
        // First increment (should work)
        result.current.commentActions.incrementScore(comment, initialScore)
      })

      const afterFirstIncrement = result.current.comments.find(c => c.id === comment.id).score

      act(() => {
        // Try to increment again with stale current score (should not work)
        result.current.commentActions.incrementScore(comment, initialScore)
      })

      const finalComment = result.current.comments.find(c => c.id === comment.id)
      expect(finalComment.score).toBe(afterFirstIncrement)
    })

    it('should increment score for nested replies', () => {
      const parentComment = result.current.comments[1]
      const reply = parentComment.replies[0]
      const initialScore = reply.score

      act(() => {
        result.current.commentActions.incrementScore(reply, initialScore)
      })

      const updatedParent = result.current.comments.find(c => c.id === parentComment.id)
      const updatedReply = updatedParent.replies.find(r => r.id === reply.id)
      expect(updatedReply.score).toBe(initialScore + 1)
    })
  })

  describe('decrementScore', () => {
    it('should decrement score when current score matches', () => {
      const comment = result.current.comments[0]
      const initialScore = comment.score

      act(() => {
        result.current.commentActions.decrementScore(comment, initialScore)
      })

      const updatedComment = result.current.comments.find(c => c.id === comment.id)
      expect(updatedComment.score).toBe(initialScore - 1)
    })

    it('should not decrement score when current score is less (spam prevention)', () => {
      const comment = result.current.comments[0]
      const initialScore = comment.score

      act(() => {
        // First decrement (should work)
        result.current.commentActions.decrementScore(comment, initialScore)
      })

      const afterFirstDecrement = result.current.comments.find(c => c.id === comment.id).score

      act(() => {
        // Try to decrement again with stale current score (should not work)
        result.current.commentActions.decrementScore(comment, initialScore)
      })

      const finalComment = result.current.comments.find(c => c.id === comment.id)
      expect(finalComment.score).toBe(afterFirstDecrement)
    })

    it('should allow score to go negative', () => {
      const comment = result.current.comments[0]

      // Decrement multiple times to go negative
      act(() => {
        result.current.commentActions.decrementScore(comment, comment.score)
      })

      let currentComment = result.current.comments.find(c => c.id === comment.id)

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.commentActions.decrementScore(currentComment, currentComment.score)
        })
        currentComment = result.current.comments.find(c => c.id === comment.id)
      }

      expect(currentComment.score).toBeLessThan(0)
    })
  })

  describe('updateContent', () => {
    it('should update comment content', () => {
      const comment = result.current.comments[0]
      const newContent = 'Updated content'

      act(() => {
        result.current.commentActions.updateContent(comment, newContent)
      })

      const updatedComment = result.current.comments.find(c => c.id === comment.id)
      expect(updatedComment.content).toBe(newContent)
    })

    it('should update nested reply content', () => {
      const parentComment = result.current.comments[1]
      const reply = parentComment.replies[0]
      const newContent = 'Updated reply content'

      act(() => {
        result.current.commentActions.updateContent(reply, newContent)
      })

      const updatedParent = result.current.comments.find(c => c.id === parentComment.id)
      const updatedReply = updatedParent.replies.find(r => r.id === reply.id)
      expect(updatedReply.content).toBe(newContent)
    })

    it('should not affect other comment properties when updating content', () => {
      const comment = result.current.comments[0]
      const originalScore = comment.score
      const originalUser = comment.user
      const originalCreatedAt = comment.createdAt

      act(() => {
        result.current.commentActions.updateContent(comment, 'New content')
      })

      const updatedComment = result.current.comments.find(c => c.id === comment.id)
      expect(updatedComment.score).toBe(originalScore)
      expect(updatedComment.user).toEqual(originalUser)
      expect(updatedComment.createdAt).toBe(originalCreatedAt)
    })
  })

  describe('Immutability', () => {
    it('should not mutate original data', () => {
      const originalData = JSON.parse(JSON.stringify(mockData))

      act(() => {
        result.current.commentActions.createComment('New comment')
        result.current.commentActions.incrementScore(result.current.comments[0], result.current.comments[0].score)
      })

      expect(mockData).toEqual(originalData)
    })

    it('should create new arrays on every update', () => {
      const firstReference = result.current.comments

      act(() => {
        result.current.commentActions.createComment('New comment')
      })

      const secondReference = result.current.comments

      expect(firstReference).not.toBe(secondReference)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty initial data', () => {
      const { result: emptyResult } = renderHook(() => useComments([]))

      expect(emptyResult.current.comments).toEqual([])

      act(() => {
        emptyResult.current.commentActions.createComment('First comment')
      })

      expect(emptyResult.current.comments).toHaveLength(1)
    })
  })
})