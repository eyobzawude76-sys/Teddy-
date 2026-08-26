"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ArrowLeft,
  GraduationCap,
  RefreshCw,
  CheckCircle,
  Lock,
  AlertTriangle,
} from "lucide-react";

import { api } from "@/lib";


interface StudentPromotion {

  studentId:string;

  studentNumber:string;

  fullName:string;

  levelNumber:number;

  gpa:number;

  cgpa:number;

  average:number;

  failedModules:number;

  committeeApproved:boolean;

  vaultLocked:boolean;

  status:string;

}





export default function PromotionReviewPage(){


const params = useParams();

const router = useRouter();

const queryClient = useQueryClient();


const studentId =
params.studentId as string;





// =============================
// LOAD STUDENT
// =============================


const {
 data:student,
 isLoading,
 isError

}=useQuery<StudentPromotion>({


queryKey:[
 "promotion-student",
 studentId
],


queryFn:async()=>{


const res =
await api.get(
 `/promotions/student/${studentId}`
);


return res.data;


},


enabled:!!studentId


});







// =============================
// PROMOTION ACTION
// =============================


const mutation =
useMutation({


mutationFn:
async(action:string)=>{


return api.post(

`/promotions/execute/${studentId}?action=${action}`

);


},



onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"promotion-student",
studentId
]

});


alert(
"Action completed successfully"
);


},



onError:(error:any)=>{


alert(

error?.response?.data?.detail ||

"Promotion failed"

);


}



});








if(isLoading){

return (

<div className="p-6 flex gap-2">

<RefreshCw className="animate-spin"/>

Loading student...

</div>

);

}





if(isError){

return (

<div className="p-6 text-red-600">

Student loading failed.

</div>

);

}





return (

<div className="p-6 space-y-6">





{/* HEADER */}


<div className="flex justify-between items-center">


<div>


<button

onClick={()=>router.back()}

className="
flex
items-center
gap-2
text-gray-600
"

>

<ArrowLeft size={18}/>

Back

</button>




<h1 className="
text-3xl
font-bold
mt-3
">

Promotion Review

</h1>


<p className="text-gray-500">

Verify student before promotion.

</p>


</div>




<GraduationCap
size={40}
/>


</div>







{/* STUDENT INFO */}



<div className="
bg-white
border
rounded-xl
p-6
grid
md:grid-cols-3
gap-5
">



<div>

<p className="text-gray-500 text-sm">

Student Name

</p>


<h2 className="font-bold">

{student?.fullName}

</h2>


</div>




<div>

<p className="text-gray-500 text-sm">

Student ID

</p>


<h2 className="font-bold">

{student?.studentNumber}

</h2>


</div>





<div>

<p className="text-gray-500 text-sm">

Current Level

</p>


<h2 className="font-bold">

Level {student?.levelNumber}

</h2>


</div>



</div>









{/* RESULT */}



<div className="
bg-white
border
rounded-xl
p-6
space-y-4
">



<h2 className="
font-bold
text-lg
">

Academic Result

</h2>





<div className="
grid
md:grid-cols-4
gap-4
">



<div className="bg-gray-50 p-4 rounded">

<p className="text-sm text-gray-500">

GPA

</p>


<b>
{student?.gpa}
</b>


</div>





<div className="bg-gray-50 p-4 rounded">

<p className="text-sm text-gray-500">

CGPA

</p>


<b>
{student?.cgpa}
</b>


</div>





<div className="bg-gray-50 p-4 rounded">

<p className="text-sm text-gray-500">

Average

</p>


<b>
{student?.average}
</b>


</div>





<div className="bg-gray-50 p-4 rounded">

<p className="text-sm text-gray-500">

Failed Modules

</p>


<b>

{student?.failedModules}

</b>


</div>



</div>


</div>









{/* APPROVAL CHECK */}


<div className="
bg-white
border
rounded-xl
p-6
space-y-3
">


<h2 className="font-bold">

Verification

</h2>




<div className="flex gap-3 items-center">


{
student?.committeeApproved ?

<>

<CheckCircle className="text-green-600"/>

Committee Approved

</>

:

<>

<AlertTriangle className="text-red-600"/>

Waiting Committee

</>

}


</div>






<div className="flex gap-3 items-center">


{
student?.vaultLocked ?

<>

<Lock className="text-green-600"/>

Record Vault Locked

</>


:

<>

<AlertTriangle className="text-red-600"/>

Vault Not Locked

</>

}


</div>




</div>









{/* ACTION BUTTONS */}


<div className="
bg-white
border
rounded-xl
p-6
flex
gap-4
flex-wrap
">



<button

disabled={mutation.isPending}

onClick={()=>
mutation.mutate("promote")
}

className="
bg-blue-600
text-white
px-6
py-3
rounded-lg
"

>

Promote

</button>






<button

disabled={mutation.isPending}

onClick={()=>
mutation.mutate("graduate")
}

className="
bg-green-600
text-white
px-6
py-3
rounded-lg
"

>

Graduate

</button>







<button

disabled={mutation.isPending}

onClick={()=>
mutation.mutate("repeat")
}

className="
bg-yellow-500
text-white
px-6
py-3
rounded-lg
"

>

Repeat

</button>





</div>





</div>

);


}