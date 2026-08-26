"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";
import {
  Users,
  GraduationCap,
  RefreshCw,
  ArrowRight
} from "lucide-react";


interface PromotionStudent {

  _id:string;

  studentId:string;

  fullName:string;

  levelId:string;

  gpa:number;

  cgpa:number;

}



function DashboardCard({

 title,
 value,
 icon

}:{

 title:string;
 value:number;
 icon:React.ReactNode;

}){


return (

<div className="
bg-white
border
rounded-xl
p-6
shadow-sm
flex
items-center
gap-4
">


<div className="
bg-gray-100
p-3
rounded-lg
">

{icon}

</div>



<div>

<p className="text-gray-500 text-sm">

{title}

</p>


<p className="text-2xl font-bold">

{value}

</p>


</div>


</div>

);


}




export default function PromotionDashboard(){



const {

data:students,
isLoading,
refetch,
isFetching

}=useQuery<PromotionStudent[]>({

queryKey:[
"promotion-students"
],


queryFn:async()=>{


const res =
await api.get(
"/promotions/students"
);


return res.data;


}


});






if(isLoading){

return (

<div className="p-6">

Loading promotion dashboard...

</div>

);

}




return (

<div className="p-6 space-y-8">



<div className="
flex
justify-between
items-center
">


<div>


<h1 className="
text-3xl
font-bold
">

Promotion Dashboard

</h1>


<p className="text-gray-500">

Manage student academic promotion.

</p>


</div>



<button

onClick={()=>refetch()}

className="
border
rounded-lg
px-4
py-2
flex
gap-2
items-center
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







<div className="
grid
md:grid-cols-3
gap-5
">


<DashboardCard

title="Eligible Students"

value={
students?.length ?? 0
}

icon={
<Users/>
}

/>



<DashboardCard

title="Promotion Ready"

value={
students?.filter(
s=>s.gpa >=2
).length ??0
}

icon={
<GraduationCap/>
}

/>


<DashboardCard

title="Levels"

value={
new Set(
students?.map(
s=>s.levelId
)
).size ??0
}

icon={
<ArrowRight/>
}

/>


</div>







<div className="
bg-white
border
rounded-xl
p-6
">


<h2 className="
text-lg
font-bold
mb-4
">

Student Promotion

</h2>



<Link

href="/promotions/students"

className="
bg-blue-600
text-white
px-5
py-2
rounded-lg
inline-flex
items-center
gap-2
"

>

View Students

<ArrowRight size={16}/>


</Link>



</div>



</div>


);


}