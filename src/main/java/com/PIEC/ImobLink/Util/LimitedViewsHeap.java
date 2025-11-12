package com.PIEC.ImobLink.Util;

import com.PIEC.ImobLink.DTOs.PostResponse;
import lombok.Getter;

import java.util.Comparator;
import java.util.PriorityQueue;

@Getter
public class LimitedViewsHeap {
    private PriorityQueue<PostResponse> heap;
    private final int maxSize;

    public LimitedViewsHeap() {
        this.heap = new PriorityQueue<>(Comparator.comparingInt(PostResponse::getViews));
        this.maxSize = 10;
    }

    public void add(PostResponse post) {
        heap.offer(post);
        if (heap.size() > maxSize) {
            heap.poll();
        }
    }

    public PriorityQueue<PostResponse> getHeap() {
        return new PriorityQueue<>(heap);
    }
}
