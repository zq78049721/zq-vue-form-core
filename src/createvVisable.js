import { isEmpty,isBool,isFunction } from "./uitl";


export default function(field){
    const {visable}=field;
    if(isFunction(visable)){
        return  function(data,vm){
            return visable(data,vm);
        };
    }else if(isBool(visable)){
        return function(){
            return visable;
        }
    }else if (isEmpty(visable)){
        return function(){
            return true;
        }
    }else{
        throw new Error("visable type in (bool、function、null、undefined)!");
    }
}

