
import {createAndStoreLeak, createAndStoreStart, createAndStoreStop} from './dataStorage'


function randInt(max) {
    return Math.floor(Math.random()*max)+1;
}


export async function TEST_createSomeEventsThisMonthAndStoreInLocalDB()
{
    //clearEventsLocalDB();
   

    let currentDate = new Date();
    let y = currentDate.getFullYear();
    let m = currentDate.getMonth();
    let d1 = new Date(y, m, randInt(20),randInt(20),randInt(59));
    await createAndStoreLeak(d1)
    await createAndStoreStart(d1) // there should always be a start also (also a stop if there was no leak but for the workings not so importatnt)
    d1 = new Date(y, m, 2,randInt(20),randInt(59));
    await createAndStoreLeak(d1)
    await createAndStoreStart(d1)
    d1 = new Date(y, m, 13,randInt(20),randInt(59));
    await createAndStoreLeak(d1)
    await createAndStoreStart(d1)

  
    
    d1 = new Date(y, m, 20,randInt(20),randInt(59));
    await createAndStoreLeak(d1)
    await createAndStoreStart(d1)
    
    // create start events 
    d1 = new Date(y, m, 22,19,randInt(59));
    await createAndStoreStart(d1);
    d1 = new Date(y, m, 24,19,randInt(59));
    await createAndStoreStart(d1);
    await createAndStoreLeak(d1); // leak and start event so no star for 25 of the current month !


    // increase month and create leak 
    m = currentDate.getMonth()+1;
    d1 = new Date(y, m, 2,randInt(20),randInt(59));
    await createAndStoreLeak(d1)
    await createAndStoreStart(d1)
    


    // create star in this month
    d1 = new Date(y, m, 6,19,randInt(59));
    await createAndStoreStart(d1)
    d1 = new Date(y, m, 6,22,randInt(59));
    await createAndStoreStop(d1)


     // create stop events 
     d1 = new Date(y, m, 22,21,randInt(59));
    await createAndStoreStop(d1);
     d1 = new Date(y, m, 24,21,randInt(59));
    await createAndStoreStop(d1);
    
    return;

   
}

