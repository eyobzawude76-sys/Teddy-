"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";

import {
  RefreshCw,
  Users,
  GraduationCap,
  RotateCcw,
  History,
} from "lucide-react";


interface PromotionStats {

  totalPromotions:number;

  promotedStudents:number;

  graduatedStudents:number;

  repeatStudents:number;

}



interface PromotionHistory {


  _id:string;

  studentId:string;

  previousLevelId:string;

  nextLevelId?:string;

  action:string;

  gpa:number;

  cgpa:number;

  processedBy:string;

  createdAt:string;

}




function StatCard({
 title,
 value,
 icon
}:{
 title:string;
 value:number;
 icon:React.ReactNode;
}){


return (

<div
className="
bg-white
border
rounded-xl
shadow-sm
p-5
flex
items-center
gap-4
"
>


<div
className="
bg-gray-100
p-3
rounded-lg
"
>

{icon}

</div>


<div>

<p className="text-sm text-gray-500">

{title}

</p>


<p className="text-2xl font-bold">

{value}

</p>


</div>


</div>

);

}





export default function PromotionHistoryPage(){



const {

data:stats,

isLoading:statsLoading,

refetch:refreshStats,

isFetching

}=useQuery<PromotionStats>({


queryKey:[

"promotion-statistics"

],


queryFn:async()=>{


const res =
await api.get(
"/promotions/statistics"
);


return res.data;


}


});







const {

data:history,

isLoading:historyLoading

}=useQuery<PromotionHistory[]>({


queryKey:[

"promotion-history"

],



queryFn:async()=>{


const res =
await api.get(
"/promotions/history"
);


return res.data;


}


});








if(statsLoading || historyLoading){


return (

<div className="p-6">

Loading promotion history...

</div>

);


}







return (

<div
className="
space-y-8
p-6
bg-gray-50
min-h-screen
"
>




{/* HEADER */}

<div
className="
flex
justify-between
items-center
"
>


<div>


<h1
className="
text-3xl
font-bold
"
>

Promotion Management

</h1>


<p className="text-gray-500">

Student promotion history and statistics

</p>


</div>




<button

onClick={()=>refreshStats()}

className="
flex
items-center
gap-2
border
rounded-lg
px-4
py-2
bg-white
hover:bg-gray-100
"

>


<RefreshCw

size={18}

className={
isFetching
?
"animate-spin"
:
""
/>

/>


Refresh

</button>



</div>









{/* STATISTICS */}


<div
className="
grid
md:grid-cols-4
gap-5
"
>


<StatCard

title="Total"

value={
stats?.totalPromotions ?? 0
}

icon={
<History/>
}

/>



<StatCard

title="Promoted"

value={
stats?.promotedStudents ?? 0
}

icon={
<Users/>
}

/>



<StatCard

title="Graduated"

value={
stats?.graduatedStudents ?? 0
}

icon={
<GraduationCap/>
}

/>



<StatCard

title="Repeat"

value={
stats?.repeatStudents ?? 0
}

icon={
<RotateCcw/>
}

/>



</div>









{/* HISTORY TABLE */}



<div
className="
bg-white
border
rounded-xl
shadow-sm
overflow-hidden
"
>


<div
className="
p-5
border-b
"
>


<h2
className="
font-bold
text-lg
"
>

Promotion History

</h2>


</div>





<div
className="
overflow-x-auto
"
>


<table
className="
w-full
text-sm
"
>


<thead
className="
bg-gray-50
border-b
"
>


<tr>


<th className="p-4 text-left">

Student

</th>


<th className="p-4 text-left">

Action

</th>


<th className="p-4 text-left">

Previous Level

</th>


<th className="p-4 text-left">

Next Level

</th>


<th className="p-4 text-left">

GPA

</th>


<th className="p-4 text-left">

Date

</th>


</tr>


</thead>





<tbody
className="
divide-y
"
>


{
history?.length===0 ?

<tr>

<td
colSpan={6}
className="
p-8
text-center
text-gray-500
"
>

No promotion history found.

</td>

</tr>


:


history?.map(item=>(


<tr
key={item._id}
className="
hover:bg-gray-50
"
>



<td className="p-4">

{item.studentId}

</td>




<td className="p-4">


<span
className={`
px-3
py-1
rounded-full
text-xs

${
item.action==="PROMOTED"

?
"bg-green-100 text-green-700"

:

item.action==="GRADUATED"

?
"bg-blue-100 text-blue-700"

:

"bg-yellow-100 text-yellow-700"

}

`}
>

{item.action}

</span>


</td>





<td className="p-4">

{item.previousLevelId}

</td>




<td className="p-4">

{
item.nextLevelId
||
"-"
}

</td>





<td className="p-4 font-bold">

{item.gpa}

</td>




<td className="p-4">

{
new Date(
item.createdAt
).toLocaleDateString()
}

</td>




</tr>


))


}



</tbody>



</table>



</div>



</div>





</div>

);


}