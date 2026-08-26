"use client";


import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib";
import {
  Eye
} from "lucide-react";



interface Student {


_id:string;

studentId:string;

fullName:string;

levelId:string;

gpa:number;

cgpa:number;


}




export default function PromotionStudentsPage(){



const {

data:students,
isLoading

}=useQuery<Student[]>({

queryKey:[
"promotion-student-list"
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

Loading students...

</div>

);

}






return (

<div className="p-6 space-y-6">


<h1 className="
text-3xl
font-bold
">

Promotion Students

</h1>





<div className="
bg-white
border
rounded-xl
overflow-hidden
">


<table className="w-full text-sm">


<thead className="bg-gray-50 border-b">


<tr>


<th className="p-4 text-left">
Student ID
</th>


<th className="p-4 text-left">
Name
</th>


<th className="p-4 text-left">
GPA
</th>


<th className="p-4 text-left">
CGPA
</th>


<th className="p-4">
Action
</th>


</tr>


</thead>





<tbody className="divide-y">


{
students?.map(student=>(


<tr key={student._id}>


<td className="p-4">

{student.studentId}

</td>



<td className="p-4">

{student.fullName}

</td>



<td className="p-4 font-bold">

{student.gpa}

</td>



<td className="p-4">

{student.cgpa}

</td>



<td className="p-4">


<Link

href={
`/promotions/review/${student._id}`
}

className="
bg-blue-600
text-white
px-3
py-2
rounded-lg
text-xs
flex
items-center
gap-2
w-fit
"

>


<Eye size={14}/>

Review


</Link>


</td>



</tr>


))

}



</tbody>



</table>


</div>



</div>


);


}