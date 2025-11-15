package com.PIEC.ImobLink.Util;

import com.PIEC.ImobLink.DTOs.PostResponse;
import lombok.Getter;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

@Component
public class LimitedViewsHeap {
    @Getter
    private final PriorityQueue<PostResponse> heap;
    private final int maxSize;
    private final Map<Long, PostResponse> map = new HashMap<>();


    public LimitedViewsHeap() {
        this.heap = new PriorityQueue<>(Comparator.comparingInt(PostResponse::getViews));
        this.maxSize = 10;
    }

    public synchronized void add(PostResponse post) {
        Long id = post.getId();

        if (map.containsKey(id)) {
            heap.remove(map.get(id));
        }

        map.put(id, post);

        heap.offer(post);
        if (heap.size() > maxSize) {
            PostResponse removed = heap.poll();
            map.remove(removed.getId());
        }
    }

    public synchronized void remove(long postId) {
        if (map.containsKey(postId)) {
            heap.remove(map.get(postId));
            map.remove(postId);
        }
    }
}
