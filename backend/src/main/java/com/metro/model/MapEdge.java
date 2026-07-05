package com.metro.model;
public class MapEdge {
    private String from, to;
    private int weight;
    public MapEdge() {}
    public MapEdge(String from, String to, int weight) { this.from=from; this.to=to; this.weight=weight; }
    public String getFrom(){return from;} public void setFrom(String f){this.from=f;}
    public String getTo(){return to;} public void setTo(String t){this.to=t;}
    public int getWeight(){return weight;} public void setWeight(int w){this.weight=w;}
}
