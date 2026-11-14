const fs=require('fs');
function parse(t){t=t.replace(/^\uFEFF/,'');const rows=[];let row=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];
if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
else if(c=='"')q=true;else if(c==','){row.push(f);f=''}else if(c=='\n'){row.push(f);rows.push(row);row=[];f=''}else if(c=='\r'){}else f+=c}
if(f!==''||row.length){row.push(f);rows.push(row)}const h=rows.shift();return rows.filter(r=>r.length>1).map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])))}
module.exports=p=>parse(fs.readFileSync(p,'utf8'));
