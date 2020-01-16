import { override } from "../../util";

override(ColliderManager,'update',o=>function(){
    this.hide();
});