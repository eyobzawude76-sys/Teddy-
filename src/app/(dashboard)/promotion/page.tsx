'use client';

import { useEffect, useState } from "react";
import { api } from "@/lib";
import {
  RefreshCw,
  GraduationCap,
  CheckCircle,
  Lock,
  ArrowUpCircle,
} from "lucide-react";


type StudentPromotion = {

  studentId:string;

  studentNumber:string;

  fullName:string;

  currentLevel:number;

  gpa:number;

  cgpa:number;

  committeeApproved:boolean;

  vaultLocked:boolean;

};



export default function PromoterPage(){


  const [students,setStudents] =
    useState<StudentPromotion[]>([]);


  const [loading,setLoading] =
    useState(true);


  const [error,setError] =
    useState("");



  const loadStudents = async()=>{


    try{


      setLoading(true);


      const res =
        await api.get(
          "/promotions/pending"
        );


      setStudents(
        res.data || []
      );


    }catch(err:any){


      setError(
        err?.response?.data?.detail ||
        "Student loading failed"
      );


    }finally{


      setLoading(false);


    }


  };



  useEffect(()=>{

    loadStudents();

  },[]);





  const executePromotion = async(
    studentId:string,
    action:string
  )=>{


    const confirmAction =
      window.confirm(
        `Student ${action} gochuu barbaaddaa?`
      );


    if(!confirmAction)
      return;



    try{


      await api.post(

        `/promotions/execute/${studentId}`,

        {
          action
        }

      );



      alert(
        `Student ${action} successful`
      );


      loadStudents();



    }catch(err:any){


      alert(

        err?.response?.data?.detail ||

        "Promotion failed"

      );


    }


  };





  if(loading){


    return (

      <div className="p-10 flex gap-3">

        <RefreshCw className="animate-spin"/>

        Loading students...

      </div>

    );


  }




  return (


    <div className="min-h-screen bg-gray-50 p-6">


      <div className="max-w-7xl mx-auto space-y-6">



        <div className="bg-white rounded-xl border p-6 shadow-sm">


          <div className="flex items-center gap-3">


            <GraduationCap
              className="text-blue-600"
            />


            <div>


              <h1 className="text-2xl font-bold">

                Promoter Dashboard

              </h1>


              <p className="text-gray-500">

                Student promotion management

              </p>


            </div>


          </div>


        </div>





        {
          error && (

            <div className="bg-red-50 text-red-700 p-4 rounded-lg">

              {error}

            </div>

          )
        }






        <div className="bg-white rounded-xl border overflow-hidden">


          <table className="w-full text-sm">


            <thead className="bg-gray-50 border-b">


              <tr>


                <th className="p-4 text-left">
                  Student
                </th>


                <th className="p-4 text-left">
                  Level
                </th>


                <th className="p-4 text-left">
                  GPA
                </th>


                <th className="p-4 text-left">
                  Approval
                </th>


                <th className="p-4 text-left">
                  Action
                </th>


              </tr>


            </thead>





            <tbody className="divide-y">



            {
              students.map(student=>(


                <tr key={student.studentId}>


                  <td className="p-4">

                    <p className="font-semibold">
                      {student.fullName}
                    </p>

                    <p className="text-gray-500">
                      {student.studentNumber}
                    </p>

                  </td>



                  <td className="p-4">

                    Level {student.currentLevel}

                  </td>



                  <td className="p-4 font-bold">

                    {student.gpa}

                  </td>




                  <td className="p-4">


                    {
                      student.vaultLocked ? (

                        <span className="flex items-center gap-1 text-green-600">

                          <Lock size={15}/>

                          Locked

                        </span>


                      ):(

                        <span className="text-red-600">

                          Not Ready

                        </span>

                      )

                    }


                  </td>





                  <td className="p-4 space-x-2">


                    <button

                      disabled={!student.vaultLocked}

                      onClick={()=>executePromotion(
                        student.studentId,
                        "promote"
                      )}

                      className="
                      bg-blue-600
                      text-white
                      px-3
                      py-1
                      rounded
                      text-xs
                      disabled:bg-gray-300
                      "

                    >

                      Promote

                    </button>




                    <button

                      disabled={!student.vaultLocked}

                      onClick={()=>executePromotion(
                        student.studentId,
                        "graduate"
                      )}

                      className="
                      bg-green-600
                      text-white
                      px-3
                      py-1
                      rounded
                      text-xs
                      disabled:bg-gray-300
                      "

                    >

                      Graduate

                    </button>



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
{/* HEADER ACTION */}

<div className="flex justify-end">

<button

onClick={loadStudents}

className="
flex
items-center
gap-2
border
bg-white
px-4
py-2
rounded-lg
hover:bg-gray-50
"

>

<RefreshCw size={18}/>

Refresh

</button>

</div>



{/* EMPTY DATA */}

{
students.length === 0 && (

<div className="
bg-white
border
rounded-xl
p-10
text-center
text-gray-500
">

<CheckCircle className="mx-auto mb-3"/>

<p>

No students waiting for promotion.

</p>

</div>

)
}





{/* STUDENT PROMOTION CARDS */}

<div className="
grid
md:grid-cols-2
lg:grid-cols-3
gap-5
">


{
students.map((student)=>(


<div

key={student.studentId}

className="
bg-white
border
rounded-xl
shadow-sm
p-5
space-y-4
"

>


<div className="
flex
justify-between
items-center
">


<div>


<h2 className="font-bold">

{student.fullName}

</h2>


<p className="text-sm text-gray-500">

{student.studentNumber}

</p>


</div>



<ArrowUpCircle
className="text-blue-600"
/>


</div>






<div className="space-y-2 text-sm">


<p>

Current Level:

<strong className="ml-2">

Level {student.currentLevel}

</strong>

</p>



<p>

GPA:

<strong className="ml-2">

{student.gpa}

</strong>

</p>



<p>

CGPA:

<strong className="ml-2">

{student.cgpa}

</strong>

</p>


</div>







<div className="border-t pt-3">


{
student.vaultLocked ? (

<div className="
flex
items-center
gap-2
text-green-600
text-sm
">

<Lock size={15}/>

Record Office Locked

</div>


):(


<div className="
text-red-600
text-sm
">

Waiting Record Office

</div>


)

}


</div>








<div className="flex gap-2 pt-3">



<button

disabled={!student.vaultLocked}

onClick={()=>executePromotion(
student.studentId,
"promote"
)}

className="
flex-1
bg-blue-600
text-white
rounded-lg
py-2
text-sm
disabled:bg-gray-300
"

>

Promote

</button>






<button

disabled={!student.vaultLocked}

onClick={()=>executePromotion(
student.studentId,
"graduate"
)}

className="
flex-1
bg-green-600
text-white
rounded-lg
py-2
text-sm
disabled:bg-gray-300
"

>

Graduate

</button>





<button

disabled={!student.vaultLocked}

onClick={()=>executePromotion(
student.studentId,
"repeat"
)}

className="
flex-1
bg-orange-500
text-white
rounded-lg
py-2
text-sm
disabled:bg-gray-300
"

>

Repeat

</button>




</div>





</div>


))

}


</div>