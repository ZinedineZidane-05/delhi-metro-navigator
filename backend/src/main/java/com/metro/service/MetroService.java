package com.metro.service;

import com.metro.model.MapEdge;
import com.metro.model.PathResponse;
import com.metro.model.StationInfo;
import com.metro.model.Vertex;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MetroService {

    private HashMap<String, Vertex> vtces;

    @PostConstruct
    public void init() { vtces = new HashMap<>(); createMetroMap(); }

    public void addVertex(String v) { vtces.put(v, new Vertex()); }
    public void addEdge(String v1, String v2, int val) {
        Vertex a=vtces.get(v1),b=vtces.get(v2);
        if(a==null||b==null||a.nbrs.containsKey(v2)) return;
        a.nbrs.put(v2,val); b.nbrs.put(v1,val);
    }
    public boolean containsVertex(String v) { return vtces.containsKey(v); }
    public boolean containsEdge(String v1, String v2) {
        Vertex a=vtces.get(v1),b=vtces.get(v2);
        return a!=null && b!=null && a.nbrs.containsKey(v2);
    }
    public boolean hasPath(String v1, String v2, HashMap<String,Boolean> p) {
        if(containsEdge(v1,v2)) return true;
        p.put(v1,true); Vertex vtx=vtces.get(v1); if(vtx==null) return false;
        for(String n:vtx.nbrs.keySet()) if(!p.containsKey(n)&&hasPath(n,v2,p)) return true;
        return false;
    }
    public boolean hasPathWithBlocked(String v1, String v2, HashMap<String,Boolean> p, Set<String> bl) {
        if(bl.contains(v1)||bl.contains(v2)) return false;
        if(containsEdge(v1,v2)) return true;
        p.put(v1,true); Vertex vtx=vtces.get(v1); if(vtx==null) return false;
        for(String n:vtx.nbrs.keySet())
            if(!p.containsKey(n)&&!bl.contains(n)&&hasPathWithBlocked(n,v2,p,bl)) return true;
        return false;
    }

    private class DijkstraPair implements Comparable<DijkstraPair> {
        String vname,psf; int cost;
        @Override public int compareTo(DijkstraPair o) { return o.cost - this.cost; }
    }
    public int dijkstra(String s, String d, boolean nan) { return dijkstraInternal(s,d,nan,Collections.emptySet()); }
    public int dijkstraWithBlocked(String s, String d, boolean nan, Set<String> bl) { return dijkstraInternal(s,d,nan,bl); }

    private int dijkstraInternal(String src, String des, boolean nan, Set<String> bl) {
        int val=0; HashMap<String,DijkstraPair> map=new HashMap<>(); Heap<DijkstraPair> heap=new Heap<>();
        for(String key:vtces.keySet()) {
            if(bl.contains(key)) continue;
            DijkstraPair np=new DijkstraPair(); np.vname=key; np.cost=Integer.MAX_VALUE;
            if(key.equals(src)){np.cost=0;np.psf=key;}
            heap.add(np); map.put(key,np);
        }
        while(!heap.isEmpty()) {
            DijkstraPair rp=heap.remove();
            if(rp.vname.equals(des)){val=rp.cost;break;}
            map.remove(rp.vname); Vertex v=vtces.get(rp.vname);
            for(String nbr:v.nbrs.keySet()) {
                if(bl.contains(nbr)) continue;
                if(map.containsKey(nbr)) {
                    int oc=map.get(nbr).cost;
                    int nc=nan?rp.cost+120+40*v.nbrs.get(nbr):rp.cost+v.nbrs.get(nbr);
                    if(nc<oc){DijkstraPair gp=map.get(nbr);gp.psf=rp.psf+nbr;gp.cost=nc;heap.updatePriority(gp);}
                }
            }
        }
        return val;
    }

    private class Pair { String vname,psf; int min_dis,min_time; }

    public String getMinimumDistancePath(String s,String d){return minDistInternal(s,d,Collections.emptySet());}
    public String getMinDistancePathWithBlocked(String s,String d,Set<String> bl){return minDistInternal(s,d,bl);}
    private String minDistInternal(String src,String dst,Set<String> bl) {
        int min=Integer.MAX_VALUE; String ans="";
        HashMap<String,Boolean> proc=new HashMap<>(); LinkedList<Pair> stack=new LinkedList<>();
        Pair sp=new Pair();sp.vname=src;sp.psf=src+"  ";sp.min_dis=0; stack.addFirst(sp);
        while(!stack.isEmpty()) {
            Pair rp=stack.removeFirst();
            if(proc.containsKey(rp.vname)) continue; proc.put(rp.vname,true);
            if(rp.vname.equals(dst)){if(rp.min_dis<min){ans=rp.psf;min=rp.min_dis;}continue;}
            Vertex rpv=vtces.get(rp.vname);
            for(String n:rpv.nbrs.keySet()){
                if(!proc.containsKey(n)&&!bl.contains(n)){
                    Pair np=new Pair();np.vname=n;np.psf=rp.psf+n+"  ";
                    np.min_dis=rp.min_dis+rpv.nbrs.get(n);stack.addFirst(np);
                }
            }
        }
        return ans+Integer.toString(min);
    }

    public String getMinimumTimePath(String s,String d){return minTimeInternal(s,d,Collections.emptySet());}
    public String getMinTimePathWithBlocked(String s,String d,Set<String> bl){return minTimeInternal(s,d,bl);}
    private String minTimeInternal(String src,String dst,Set<String> bl) {
        int min=Integer.MAX_VALUE; String ans="";
        HashMap<String,Boolean> proc=new HashMap<>(); LinkedList<Pair> stack=new LinkedList<>();
        Pair sp=new Pair();sp.vname=src;sp.psf=src+"  ";sp.min_time=0; stack.addFirst(sp);
        while(!stack.isEmpty()) {
            Pair rp=stack.removeFirst();
            if(proc.containsKey(rp.vname)) continue; proc.put(rp.vname,true);
            if(rp.vname.equals(dst)){if(rp.min_time<min){ans=rp.psf;min=rp.min_time;}continue;}
            Vertex rpv=vtces.get(rp.vname);
            for(String n:rpv.nbrs.keySet()){
                if(!proc.containsKey(n)&&!bl.contains(n)){
                    Pair np=new Pair();np.vname=n;np.psf=rp.psf+n+"  ";
                    np.min_time=rp.min_time+120+40*rpv.nbrs.get(n);stack.addFirst(np);
                }
            }
        }
        return ans+Double.toString(Math.ceil((double)min/60));
    }

    public ArrayList<String> getInterchanges(String str) {
        ArrayList<String> arr=new ArrayList<>(); String[] res=str.split("  ");
        arr.add(res[0]); int count=0;
        for(int i=1;i<res.length-1;i++){
            int idx=res[i].indexOf('~'); String s=res[i].substring(idx+1);
            if(s.length()==2){
                String prev=res[i-1].substring(res[i-1].indexOf('~')+1);
                String next=res[i+1].substring(res[i+1].indexOf('~')+1);
                if(prev.equals(next)){arr.add(res[i]);}
                else{arr.add(res[i]+" ==> "+res[i+1]);i++;count++;}
            } else {arr.add(res[i]);}
        }
        arr.add(Integer.toString(count)); arr.add(res[res.length-1]); return arr;
    }

    public int calculateFare(int km) {
        if(km<=2) return 10; if(km<=5) return 20; if(km<=12) return 30;
        if(km<=21) return 40; if(km<=32) return 50; return 60;
    }
    public String getFareBreakdown(int km, int fare) {
        String slab; if(km<=2) slab="0-2 KM"; else if(km<=5) slab="2-5 KM";
        else if(km<=12) slab="5-12 KM"; else if(km<=21) slab="12-21 KM";
        else if(km<=32) slab="21-32 KM"; else slab="32+ KM";
        return "Distance: "+km+" KM | Slab: "+slab+" | Fare: \u20B9"+fare;
    }
    private void applyFare(PathResponse r,int km){int f=calculateFare(km);r.setFare(f);r.setFareBreakdown(getFareBreakdown(km,f));}

    private List<String> parseLines(String fn){
        int i=fn.indexOf('~');if(i==-1) return List.of();
        String c=fn.substring(i+1);List<String> l=new ArrayList<>();
        if(c.contains("B"))l.add("Blue");if(c.contains("Y"))l.add("Yellow");
        if(c.contains("O"))l.add("Orange");if(c.contains("P"))l.add("Pink");
        if(c.contains("R"))l.add("Red");return l;
    }
    private String parseName(String fn){int i=fn.indexOf('~');return i==-1?fn:fn.substring(0,i);}

    public List<StationInfo> getStations(){
        List<StationInfo> st=new ArrayList<>();List<String> keys=new ArrayList<>(vtces.keySet());Collections.sort(keys);
        for(String k:keys) st.add(new StationInfo(parseName(k),k,parseLines(k),k.substring(k.indexOf('~')+1)));
        return st;
    }
    public List<MapEdge> getMapEdges(){
        List<MapEdge> edges=new ArrayList<>();Set<String> vis=new HashSet<>();
        for(String k:vtces.keySet()){Vertex v=vtces.get(k);
            for(String n:v.nbrs.keySet()){String ek=k.compareTo(n)<0?k+"|"+n:n+"|"+k;
                if(!vis.contains(ek)){edges.add(new MapEdge(k,n,v.nbrs.get(n)));vis.add(ek);}
            }
        } return edges;
    }

    private PathResponse validate(String src,String dst){
        PathResponse r=new PathResponse();r.setSource(src);r.setDestination(dst);
        if(!containsVertex(src)||!containsVertex(dst)){r.setError("Invalid station name(s).");return r;}
        if(!hasPath(src,dst,new HashMap<>())){r.setError("No path exists between the given stations.");return r;}
        return r;
    }

    public PathResponse getShortestDistance(String src,String dst){
        PathResponse r=validate(src,dst);if(r.getError()!=null) return r;
        int d=dijkstra(src,dst,false);r.setDistance(d);applyFare(r,d);return r;
    }
    public PathResponse getShortestTime(String src,String dst){
        PathResponse r=validate(src,dst);if(r.getError()!=null) return r;
        r.setTime(Math.ceil((double)dijkstra(src,dst,true)/60));
        int d=dijkstra(src,dst,false);r.setDistance(d);applyFare(r,d);return r;
    }
    public PathResponse getShortestPathByDistance(String src,String dst){
        PathResponse r=validate(src,dst);if(r.getError()!=null) return r;
        ArrayList<String> res=getInterchanges(getMinimumDistancePath(src,dst));int len=res.size();
        List<String> path=new ArrayList<>(res.subList(0,len-2));
        r.setPath(path);r.setTotalStops(path.size());r.setInterchanges(Integer.parseInt(res.get(len-2)));
        int d=Integer.parseInt(res.get(len-1));r.setDistance(d);applyFare(r,d);return r;
    }
    public PathResponse getShortestPathByTime(String src,String dst){
        PathResponse r=validate(src,dst);if(r.getError()!=null) return r;
        ArrayList<String> res=getInterchanges(getMinimumTimePath(src,dst));int len=res.size();
        List<String> path=new ArrayList<>(res.subList(0,len-2));
        r.setPath(path);r.setTotalStops(path.size());r.setInterchanges(Integer.parseInt(res.get(len-2)));
        r.setTime(Double.parseDouble(res.get(len-1)));
        int d=dijkstra(src,dst,false);r.setDistance(d);applyFare(r,d);return r;
    }

    public PathResponse getAlternatePathByDistance(String src,String dst,List<String> blocked){
        PathResponse r=new PathResponse();r.setSource(src);r.setDestination(dst);
        r.setAlternateRoute(true);r.setBlockedStations(blocked);
        Set<String> bs=new HashSet<>(blocked);
        if(!containsVertex(src)||!containsVertex(dst)){r.setError("Invalid station name(s).");return r;}
        if(bs.contains(src)){r.setError("Source station '"+parseName(src)+"' is blocked.");return r;}
        if(bs.contains(dst)){r.setError("Destination station '"+parseName(dst)+"' is blocked.");return r;}
        if(!hasPathWithBlocked(src,dst,new HashMap<>(),bs)){r.setError("No alternate route available. Blocked stations disconnect the path.");return r;}
        int d=dijkstraWithBlocked(src,dst,false,bs);r.setDistance(d);applyFare(r,d);
        ArrayList<String> res=getInterchanges(getMinDistancePathWithBlocked(src,dst,bs));int len=res.size();
        List<String> path=new ArrayList<>(res.subList(0,len-2));
        r.setPath(path);r.setTotalStops(path.size());r.setInterchanges(Integer.parseInt(res.get(len-2)));return r;
    }
    public PathResponse getAlternatePathByTime(String src,String dst,List<String> blocked){
        PathResponse r=new PathResponse();r.setSource(src);r.setDestination(dst);
        r.setAlternateRoute(true);r.setBlockedStations(blocked);
        Set<String> bs=new HashSet<>(blocked);
        if(!containsVertex(src)||!containsVertex(dst)){r.setError("Invalid station name(s).");return r;}
        if(bs.contains(src)){r.setError("Source station '"+parseName(src)+"' is blocked.");return r;}
        if(bs.contains(dst)){r.setError("Destination station '"+parseName(dst)+"' is blocked.");return r;}
        if(!hasPathWithBlocked(src,dst,new HashMap<>(),bs)){r.setError("No alternate route available. Blocked stations disconnect the path.");return r;}
        r.setTime(Math.ceil((double)dijkstraWithBlocked(src,dst,true,bs)/60));
        int d=dijkstraWithBlocked(src,dst,false,bs);r.setDistance(d);applyFare(r,d);
        ArrayList<String> res=getInterchanges(getMinTimePathWithBlocked(src,dst,bs));int len=res.size();
        List<String> path=new ArrayList<>(res.subList(0,len-2));
        r.setPath(path);r.setTotalStops(path.size());r.setInterchanges(Integer.parseInt(res.get(len-2)));return r;
    }

    private void createMetroMap() {
        addVertex("Noida Sector 62~B");addVertex("Botanical Garden~B");
        addVertex("Yamuna Bank~B");addVertex("Rajiv Chowk~BY");
        addVertex("Vaishali~B");addVertex("Moti Nagar~B");
        addVertex("Janak Puri West~BO");addVertex("Dwarka Sector 21~B");
        addVertex("Huda City Center~Y");addVertex("Saket~Y");
        addVertex("Vishwavidyalaya~Y");addVertex("Chandni Chowk~Y");
        addVertex("New Delhi~YO");addVertex("AIIMS~Y");
        addVertex("Shivaji Stadium~O");addVertex("DDS Campus~O");
        addVertex("IGI Airport~O");addVertex("Rajouri Garden~BP");
        addVertex("Netaji Subhash Place~PR");addVertex("Punjabi Bagh West~P");

        addEdge("Noida Sector 62~B","Botanical Garden~B",8);
        addEdge("Botanical Garden~B","Yamuna Bank~B",10);
        addEdge("Yamuna Bank~B","Vaishali~B",8);
        addEdge("Yamuna Bank~B","Rajiv Chowk~BY",6);
        addEdge("Rajiv Chowk~BY","Moti Nagar~B",9);
        addEdge("Moti Nagar~B","Janak Puri West~BO",7);
        addEdge("Janak Puri West~BO","Dwarka Sector 21~B",6);
        addEdge("Huda City Center~Y","Saket~Y",15);
        addEdge("Saket~Y","AIIMS~Y",6);
        addEdge("AIIMS~Y","Rajiv Chowk~BY",7);
        addEdge("Rajiv Chowk~BY","New Delhi~YO",1);
        addEdge("New Delhi~YO","Chandni Chowk~Y",2);
        addEdge("Chandni Chowk~Y","Vishwavidyalaya~Y",5);
        addEdge("New Delhi~YO","Shivaji Stadium~O",2);
        addEdge("Shivaji Stadium~O","DDS Campus~O",7);
        addEdge("DDS Campus~O","IGI Airport~O",8);
        addEdge("Moti Nagar~B","Rajouri Garden~BP",2);
        addEdge("Punjabi Bagh West~P","Rajouri Garden~BP",2);
        addEdge("Punjabi Bagh West~P","Netaji Subhash Place~PR",3);
    }
}
