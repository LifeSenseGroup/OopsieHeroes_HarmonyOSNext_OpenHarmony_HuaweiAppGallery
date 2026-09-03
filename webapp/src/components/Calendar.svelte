<script>
	import {createEventDispatcher, onMount} from 'svelte';

	export var headers = [];
	export let days = [];
	export let items = [];
	
	let dispatch = createEventDispatcher();
	
</script>


<div class="calendar">
	{#each headers as header}
	<span class="day-name" on:click={()=>dispatch('headerClick',header)}>{header}</span>
	{/each}

	{#each days as day}
		{#if day.enabled}
			<span class="day" on:click={()=>dispatch('dayClick',day)}>{day.name}</span>
		{:else}
			<span class="day day-disabled" on:click={()=>dispatch('dayClick',day)}>{day.name}</span>
		{/if}
	{/each}
		
	{#each items as item}
		<section
			on:click={()=>dispatch('itemClick',item)} 
			class="task {item.className}"
      style="grid-column: {item.startCol} / span {item.len};      
      grid-row: {item.startRow};  
      align-self: {item.isBottom?'end':'center'};"
			>

      {#if item.title == "star"}
      <img src = "build/images/star_icon.svg" style="height:90%; width:90%"alt="star"/>
      {/if}

      {#if item.title == "leak"}
      <svg style="height:90%; width:90% ; max-width:100px" fill="#FFFFFF" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	      viewBox="0 0 100 100"
	      xml:space="preserve">
        <g>
	        <circle cx="50" cy="50" r="40" stroke="white" stroke-width="2" fill="blue" />
        </g>
      </svg>
       {/if}

       {#if item.title == "circle"}
       <svg style="height:90%; width:90% ; max-width:100px" fill="#FFFFFF" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
         viewBox="0 0 100 100"
         xml:space="preserve">
         <g>
           <circle cx="50" cy="50" r="40" stroke="white" stroke-width="12" fill="none" />
         </g>
       </svg>
        {/if}

			{#if item.detailHeader}
			<div class="task-detail">
				<h2>{item.detailHeader}</h2>
				<p>{item.detailContent}</p>
			</div>
			{/if}
		</section>
	{/each}
</div>


<style>
.calendar {
  display: grid;
  width: 100%;
  height: 40vh;
  grid-template-columns:  repeat(7, minmax(12px, 1fr));
  grid-template-rows: minmax(20px, 0.3fr) repeat(5, minmax(12px, 1fr));
  grid-auto-rows: minmax(12px, 1fr);
  overflow: auto;
  font-family: Arial;
}

.day {
  border-bottom: 1px solid rgba(166, 168, 179, 0.12);
  border-right: 1px solid rgba(166, 168, 179, 0.12);
  font-size: 2vh;
  box-sizing: border-box;
  color: white;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  font-family: Arial;
}

.day:nth-of-type(7n + 7) {
  border-right: 0;
}
.day:nth-of-type(n + 1):nth-of-type(-n + 7) {
  grid-row: 1;
}
.day:nth-of-type(n + 8):nth-of-type(-n + 14) {
  grid-row: 2;
}
.day:nth-of-type(n + 15):nth-of-type(-n + 21) {
  grid-row: 3;
}
.day:nth-of-type(n + 22):nth-of-type(-n + 28) {
  grid-row: 4;
}
.day:nth-of-type(n + 29):nth-of-type(-n + 35) {
  grid-row: 5;
}
.day:nth-of-type(n + 36):nth-of-type(-n + 42) {
  grid-row: 6;
}
.day:nth-of-type(7n + 1) {
  grid-column: 1/1;
}
.day:nth-of-type(7n + 2) {
  grid-column: 2/2;
}
.day:nth-of-type(7n + 3) {
  grid-column: 3/3;
}
.day:nth-of-type(7n + 4) {
  grid-column: 4/4;
}
.day:nth-of-type(7n + 5) {
  grid-column: 5/5;
}
.day:nth-of-type(7n + 6) {
  grid-column: 6/6;
}
.day:nth-of-type(7n + 7) {
  grid-column: 7/7;
}
.day-name {
  font-size: 12px;
  text-transform: uppercase;
  color: white;
  text-align: center;
  align-self: center;
  border-bottom: 1px solid rgba(166, 168, 179, 0.12);
  line-height: 5px;
  font-weight: 50;
}
.day-disabled {
  color: rgba(152, 160, 166, 0.5);
  /*background-color: #0E142F; */
  cursor: not-allowed;
}

.task {
  border-left-width: 3px;
  padding: 1px 2px;
  margin: 1px;
  border-left-style: solid;
  font-size: 14px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: center;
	z-index:1;
	border-radius: 1px;
}
.task--warning {
  border-left-color: #fdb44d;
  background: #fef0db;
  color: #fc9b10;
  margin-top: -5px;
}
.task--danger {
  border-left-color: #fa607e;
  grid-column: 2 / span 3;
  grid-row: 3;
  margin-top: 5px;
  background: rgba(253, 197, 208, 0.7);
  color: #f8254e;
}
.task--info {
  border-left-color: #4786ff;
  margin-top: 5px;
  background: rgba(218, 231, 255, 0.7);
  color: #0a5eff;
}
.task--primary {
  /*background: #4786ff; */
  border: 0;
  border-radius: 4px;
  color: #f00;
  /* box-shadow: 0 10px 14px rgba(71, 134, 255, 0.4); */
}
.task-detail {
  position: absolute;
  left: 0;
  top: calc(100% + 8px);
  background: #efe;
  border: 1px solid rgba(166, 168, 179, 0.2);
  color: #100;
  padding: 2px;
  box-sizing: border-box;
  border-radius: 1px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 2;
}
.task-detail:after, .task-detail:before {
  bottom: 100%;
  left: 30%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.task-detail:before {
  border-bottom-color: rgba(166, 168, 179, 0.2);
  border-width: 2px;
  margin-left: -2px;
}
.task-detail:after {
  border-bottom-color: #fff;
  border-width: 2px;
  margin-left: -2px;
}
.task-detail h2 {
  font-size: 5px;
  margin: 0;
  color: #91565d;
}
.task-detail p {
  margin-top: 4px;
  font-size: 2px;
  margin-bottom: 0;
  font-weight: 50;
  color: rgba(81, 86, 93, 0.7);
}

</style>


