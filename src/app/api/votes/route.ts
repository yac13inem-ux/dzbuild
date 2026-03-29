import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Toggle vote (upvote/downvote)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, target_id, target_type, vote_value } = body;

    if (!user_id || !target_id || !target_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate vote value
    if (vote_value !== 1 && vote_value !== -1) {
      return NextResponse.json(
        { error: 'Invalid vote value' },
        { status: 400 }
      );
    }

    // Check if vote exists
    const existingVote = await db.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user_id,
          targetType: target_type,
          targetId: target_id,
        }
      }
    });

    if (existingVote) {
      if (existingVote.voteValue === vote_value) {
        // Remove vote (clicking same vote again removes it)
        await db.vote.delete({
          where: { id: existingVote.id }
        });

        // Update counts
        await updateVoteCounts(target_id, target_type, -vote_value);
        
        return NextResponse.json({ 
          success: true, 
          action: 'removed',
          vote_value: 0 
        });
      } else {
        // Update vote (change from upvote to downvote or vice versa)
        await db.vote.update({
          where: { id: existingVote.id },
          data: { voteValue: vote_value }
        });

        // Update counts (difference is 2: remove old, add new)
        await updateVoteCountsManually(target_id, target_type, existingVote.voteValue, vote_value);
        
        return NextResponse.json({ 
          success: true, 
          action: 'updated',
          vote_value 
        });
      }
    } else {
      // Create new vote
      await db.vote.create({
        data: {
          userId: user_id,
          targetType: target_type,
          targetId: target_id,
          voteValue: vote_value,
        }
      });

      // Update counts
      await updateVoteCounts(target_id, target_type, vote_value);
      
      return NextResponse.json({ 
        success: true, 
        action: 'created',
        vote_value 
      });
    }
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}

// Helper function to update vote counts
async function updateVoteCounts(
  targetId: string, 
  targetType: string, 
  voteValue: number
) {
  try {
    if (targetType === 'post') {
      const post = await db.post.findUnique({
        where: { id: targetId },
        select: { upvotes: true, downvotes: true }
      });

      if (post) {
        const upvotes = post.upvotes + (voteValue === 1 ? 1 : 0);
        const downvotes = post.downvotes + (voteValue === -1 ? 1 : 0);
        const score = upvotes - downvotes;

        await db.post.update({
          where: { id: targetId },
          data: { upvotes, downvotes, score }
        });
      }
    } else if (targetType === 'comment') {
      const comment = await db.comment.findUnique({
        where: { id: targetId },
        select: { upvotes: true, downvotes: true }
      });

      if (comment) {
        const upvotes = comment.upvotes + (voteValue === 1 ? 1 : 0);
        const downvotes = comment.downvotes + (voteValue === -1 ? 1 : 0);
        const score = upvotes - downvotes;

        await db.comment.update({
          where: { id: targetId },
          data: { upvotes, downvotes, score }
        });
      }
    }
  } catch (error) {
    console.error('Error updating vote counts:', error);
  }
}

// Helper function for vote changes (upvote to downvote or vice versa)
async function updateVoteCountsManually(
  targetId: string,
  targetType: string,
  oldVote: number,
  newVote: number
) {
  try {
    if (targetType === 'post') {
      const post = await db.post.findUnique({
        where: { id: targetId },
        select: { upvotes: true, downvotes: true }
      });

      if (post) {
        let upvotes = post.upvotes;
        let downvotes = post.downvotes;

        // Remove old vote
        if (oldVote === 1) upvotes--;
        if (oldVote === -1) downvotes--;

        // Add new vote
        if (newVote === 1) upvotes++;
        if (newVote === -1) downvotes++;

        const score = upvotes - downvotes;

        await db.post.update({
          where: { id: targetId },
          data: { upvotes, downvotes, score }
        });
      }
    } else if (targetType === 'comment') {
      const comment = await db.comment.findUnique({
        where: { id: targetId },
        select: { upvotes: true, downvotes: true }
      });

      if (comment) {
        let upvotes = comment.upvotes;
        let downvotes = comment.downvotes;

        // Remove old vote
        if (oldVote === 1) upvotes--;
        if (oldVote === -1) downvotes--;

        // Add new vote
        if (newVote === 1) upvotes++;
        if (newVote === -1) downvotes++;

        const score = upvotes - downvotes;

        await db.comment.update({
          where: { id: targetId },
          data: { upvotes, downvotes, score }
        });
      }
    }
  } catch (error) {
    console.error('Error updating vote counts manually:', error);
  }
}

// GET - Get vote status for multiple items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const targetIds = searchParams.get('target_ids')?.split(',') || [];
    const targetType = searchParams.get('target_type') || 'post';

    if (!userId || targetIds.length === 0) {
      return NextResponse.json({ votes: {} });
    }

    const votes = await db.vote.findMany({
      where: {
        userId,
        targetType,
        targetId: { in: targetIds }
      },
      select: {
        targetId: true,
        voteValue: true
      }
    });

    const voteMap: Record<string, number> = {};
    votes.forEach(v => {
      voteMap[v.targetId] = v.voteValue;
    });

    return NextResponse.json({ votes: voteMap });
  } catch (error) {
    console.error('Votes fetch error:', error);
    return NextResponse.json({ votes: {} });
  }
}
