import { genUniqueID } from "../manager/commonFunction";
import PatternData from "./patternData";
//import InstanceBase from "./Ontology/instanceBase";
import axios from "axios";
import { pageManage } from "../manager/PageManage";
import WatchJS from 'melanke-watchjs';

let backendURL='http://183.129.253.170:6051/'

export default class AssessedResults{
    constructor(assessedResultData){
        //console.log('assess',assessedResultData)
        this.assessedResultData = assessedResultData
        this.ar_id = Object.keys(assessedResultData)[0]
        this.intervalHandler = null
        this.estimateResultComp=null
    }

   toJson(){
    //console.log('tojson',this.assessedResultData)
    return Object.values(this.assessedResultData)[0]
}



get id(){
    return this.ar_id
}

get name(){
    return this.ar_id
}

loadByJson(key,ar_data){
    //console.log('----ar_data',ar_data)
    const assessedResultData = {
        key:ar_data
    }
    //console.log(assessedResultData)
    this.assessedResultData = assessedResultData
}

reg(estimateResultComp){
   //this.stopPolling()
    this.estimateResultComp=estimateResultComp
    //this.startPolling()
}

}