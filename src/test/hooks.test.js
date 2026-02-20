import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useComments } from '../hooks'

describe('useComments Hook', () => {
  const mockData = [
    {
      parentId: null,
      id: '1',
      content: 'First comment',
      createdAt: '1 month ago',
      score: 5,
      replyingTo: null,
      user: { username: 'user1', image: { png: '/img1.png', webp: '/img1.webp' } },
      replies: []
    },
    {
      parentId: null,
      id: '2',
      content: 'Second comment',
      createdAt: '2 weeks ago',
      score: 3,
      replyingTo: null,
      user: { username: 'user2', image: { png: '/img2.png', webp: '/img2.webp' } },
      replies: [
        {
          parentId: '2',
          id: '2-1',
          content: 'Reply to second',
          createdAt: '1 week ago',
          score: 1,
          replyingTo: 'user2',
          user: { username: 'user3', image: { png: '/img3.png', webp: '/img3.webp' } },
          replies: null
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
        result.current.actions.createComment('New comment')
      })

      expect(result.current.comments).toHaveLength(initialLength + 1)
    })

    it('should set correct fields on new comment', () => {
      act(() => {
        result.current.actions.createComment('New comment')
      })

      const newComment = result.current.comments[result.current.comments.length - 1]
      expect(newComment.content).toBe('New comment')
      expect(newComment.score).toBe(0)
      expect(newComment.createdAt).toBe('just now')
      expect(newComment.user.username).toBe('juliusomo')
      expect(newComment.parentId).toBeNull()
      expect(newComment.replyingTo).toBeNull()
      expect(newComment.replies).toEqual([])
      expect(newComment.id).toBeDefined()
    })

    it('should generate unique IDs', () => {
      act(() => {
        result.current.actions.createComment('Comment A')
        result.current.actions.createComment('Comment B')
      })

      const ids = result.current.comments.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('createReply', () => {
    it('should add a reply to a top-level comment', () => {
      const parent = result.current.comments[0]

      act(() => {
        result.current.actions.createReply(null, parent.id, parent.user.username, 'A reply')
      })

      const updated = result.current.comments.find(c => c.id === parent.id)
      expect(updated.replies).toHaveLength(1)
      expect(updated.replies[0].content).toBe('A reply')
      expect(updated.replies[0].replyingTo).toBe(parent.user.username)
      expect(updated.replies[0].parentId).toBe(parent.id)
    })

    it('should attach reply-to-reply to the top-level parent', () => {
      const parent = result.current.comments[1]
      const nestedReply = parent.replies[0]

      // parentId is the top-level comment, id is the nested reply
      act(() => {
        result.current.actions.createReply(parent.id, nestedReply.id, nestedReply.user.username, 'Deep reply')
      })

      const updatedParent = result.current.comments.find(c => c.id === parent.id)
      expect(updatedParent.replies).toHaveLength(2)
      expect(updatedParent.replies[1].content).toBe('Deep reply')
    })

    it('should set correct fields on new reply', () => {
      const parent = result.current.comments[0]

      act(() => {
        result.current.actions.createReply(null, parent.id, parent.user.username, 'Reply content')
      })

      const reply = result.current.comments.find(c => c.id === parent.id).replies[0]
      expect(reply.score).toBe(0)
      expect(reply.createdAt).toBe('just now')
      expect(reply.user.username).toBe('juliusomo')
      expect(reply.replies).toBeNull()
    })

    it('should not mutate the original replies array', () => {
      const parent = result.current.comments[0]
      const originalReplies = parent.replies

      act(() => {
        result.current.actions.createReply(null, parent.id, parent.user.username, 'Reply')
      })

      expect(originalReplies).toHaveLength(0)
    })
  })

  describe('deleteComment', () => {
    it('should delete a top-level comment', () => {
      const initialLength = result.current.comments.length

      act(() => {
        result.current.actions.deleteComment(null, '1')
      })

      expect(result.current.comments).toHaveLength(initialLength - 1)
      expect(result.current.comments.find(c => c.id === '1')).toBeUndefined()
    })

    it('should delete a nested reply', () => {
      act(() => {
        result.current.actions.deleteComment('2', '2-1')
      })

      const parent = result.current.comments.find(c => c.id === '2')
      expect(parent.replies.find(r => r.id === '2-1')).toBeUndefined()
    })

    it('should preserve other comments when deleting one', () => {
      act(() => {
        result.current.actions.deleteComment(null, '1')
      })

      expect(result.current.comments.find(c => c.id === '2')).toBeDefined()
    })
  })

  describe('updateScore', () => {
    it('should increment score with +1 delta', () => {
      const comment = result.current.comments[0]

      act(() => {
        result.current.actions.updateScore(null, comment.id, comment.score, +1)
      })

      expect(result.current.comments.find(c => c.id === comment.id).score).toBe(comment.score + 1)
    })

    it('should decrement score with -1 delta', () => {
      const comment = result.current.comments[0]

      act(() => {
        result.current.actions.updateScore(null, comment.id, comment.score, -1)
      })

      expect(result.current.comments.find(c => c.id === comment.id).score).toBe(comment.score - 1)
    })

    it('should update score on a nested reply', () => {
      const reply = result.current.comments[1].replies[0]

      act(() => {
        result.current.actions.updateScore('2', reply.id, reply.score, +1)
      })

      const updatedReply = result.current.comments.find(c => c.id === '2').replies[0]
      expect(updatedReply.score).toBe(reply.score + 1)
    })

    it('should allow score to go negative', () => {
      const comment = result.current.comments[0]

      act(() => {
        for (let i = 0; i < 10; i++) {
          const current = result.current.comments.find(c => c.id === comment.id).score
          result.current.actions.updateScore(null, comment.id, current, -1)
        }
      })

      expect(result.current.comments.find(c => c.id === comment.id).score).toBeLessThan(0)
    })
  })

  describe('editComment', () => {
    it('should update content of a top-level comment', () => {
      act(() => {
        result.current.actions.editComment(null, '1', 'Updated content')
      })

      expect(result.current.comments.find(c => c.id === '1').content).toBe('Updated content')
    })

    it('should update content of a nested reply', () => {
      act(() => {
        result.current.actions.editComment('2', '2-1', 'Updated reply')
      })

      const reply = result.current.comments.find(c => c.id === '2').replies[0]
      expect(reply.content).toBe('Updated reply')
    })

    it('should not affect other fields when editing content', () => {
      const comment = result.current.comments[0]
      const { score, createdAt, user } = comment

      act(() => {
        result.current.actions.editComment(null, '1', 'New content')
      })

      const updated = result.current.comments.find(c => c.id === '1')
      expect(updated.score).toBe(score)
      expect(updated.createdAt).toBe(createdAt)
      expect(updated.user).toEqual(user)
    })
  })

  describe('Immutability', () => {
    it('should return a new array reference on every update', () => {
      const before = result.current.comments

      act(() => {
        result.current.actions.createComment('New')
      })

      expect(result.current.comments).not.toBe(before)
    })

    it('should not mutate the original data passed to the hook', () => {
      const snapshot = JSON.parse(JSON.stringify(mockData))

      act(() => {
        result.current.actions.createComment('New')
        result.current.actions.updateScore(null, '1', 5, +1)
      })

      expect(mockData).toEqual(snapshot)
    })
  })

  describe('Edge Cases', () => {
    it('should initialise with empty array without crashing', () => {
      const { result: emptyResult } = renderHook(() => useComments([]))
      expect(emptyResult.current.comments).toEqual([])
    })

    it('should add first comment to empty state', () => {
      const { result: emptyResult } = renderHook(() => useComments([]))

      act(() => {
        emptyResult.current.actions.createComment('First ever')
      })

      expect(emptyResult.current.comments).toHaveLength(1)
    })
  })
})