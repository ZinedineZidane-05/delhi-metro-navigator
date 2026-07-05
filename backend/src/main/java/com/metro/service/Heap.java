package com.metro.service;
import java.util.ArrayList;
import java.util.HashMap;
public class Heap<T extends Comparable<T>> {
    ArrayList<T> data = new ArrayList<>();
    HashMap<T, Integer> map = new HashMap<>();
    public void add(T item) { data.add(item); map.put(item, data.size()-1); upheapify(data.size()-1); }
    private void upheapify(int ci) {
        int pi=(ci-1)/2;
        if(isLarger(data.get(ci),data.get(pi))>0){swap(pi,ci);upheapify(pi);}
    }
    private void swap(int i,int j) {
        T ith=data.get(i),jth=data.get(j);
        data.set(i,jth);data.set(j,ith);map.put(ith,j);map.put(jth,i);
    }
    public int size(){return data.size();}
    public boolean isEmpty(){return size()==0;}
    public T remove() {
        swap(0,data.size()-1); T rv=data.remove(data.size()-1);
        if(!data.isEmpty())downheapify(0); map.remove(rv); return rv;
    }
    private void downheapify(int pi) {
        int lci=2*pi+1,rci=2*pi+2,mini=pi;
        if(lci<data.size()&&isLarger(data.get(lci),data.get(mini))>0)mini=lci;
        if(rci<data.size()&&isLarger(data.get(rci),data.get(mini))>0)mini=rci;
        if(mini!=pi){swap(mini,pi);downheapify(mini);}
    }
    public T get(){return data.get(0);}
    public int isLarger(T t,T o){return t.compareTo(o);}
    public void updatePriority(T pair){int index=map.get(pair);upheapify(index);}
}
