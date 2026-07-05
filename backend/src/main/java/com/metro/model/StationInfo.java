package com.metro.model;
import java.util.List;
public class StationInfo {
    private String name, fullName, code;
    private List<String> lines;
    public StationInfo() {}
    public StationInfo(String name, String fullName, List<String> lines, String code) {
        this.name=name; this.fullName=fullName; this.lines=lines; this.code=code;
    }
    public String getName(){return name;} public void setName(String n){this.name=n;}
    public String getFullName(){return fullName;} public void setFullName(String f){this.fullName=f;}
    public List<String> getLines(){return lines;} public void setLines(List<String> l){this.lines=l;}
    public String getCode(){return code;} public void setCode(String c){this.code=c;}
}
