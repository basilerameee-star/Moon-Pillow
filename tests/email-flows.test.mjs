import test from 'node:test';
import assert from 'node:assert/strict';
import {FLOW_DEFINITIONS,evaluateFlow,renderFlowEmail} from '../lib/email-flows.ts';
const at='2026-01-31T12:15:30.000Z';
const snapshot=()=>({subjectId:'contact-1',eventId:'event-1',consent:true,unsubscribed:false,triggeredAt:at,cart:{updatedAt:at,empty:false,hasApprovedItems:true,paid:false},order:{paid:true,delivered:true,deliveredAt:at,cancelled:false,refunded:false,disputed:false,deliveryIncident:false}});

test('abandoned cart waits two hours from last activity, then becomes eligible',()=>{
 const state=snapshot();state.cart.updatedAt='2026-01-31T13:15:30.000Z';
 assert.equal(evaluateFlow('cart-abandoned',state,'2026-01-31T15:15:29.999Z').status,'waiting');
 const due=evaluateFlow('cart-abandoned',state,'2026-01-31T15:15:30.000Z');
 assert.equal(due.status,'ready');assert.equal(due.dueAt,'2026-01-31T15:15:30.000Z');
});
test('paid, empty and unapproved carts are suppressed even after their deadline',()=>{
 for(const change of [{paid:true},{empty:true},{hasApprovedItems:false},{paid:undefined}]){
  const state=snapshot();Object.assign(state.cart,change);
  assert.equal(evaluateFlow('cart-abandoned',state,'2026-05-01T00:00:00Z').status,'suppressed');
 }
});
test('withdrawn or missing consent blocks every flow, including messages already due',()=>{
 for(const {kind} of FLOW_DEFINITIONS){
  for(const change of [{consent:false},{consent:undefined},{unsubscribed:true},{unsubscribed:undefined}])assert.equal(evaluateFlow(kind,{...snapshot(),...change},'2026-06-01T00:00:00Z').status,'suppressed');
 }
});
test('welcome deadlines are immediate, three days and seven days from the same event',()=>{
 const state=snapshot();
 for(const [kind,due] of [['welcome-now','2026-01-31T12:15:30.000Z'],['welcome-day3','2026-02-03T12:15:30.000Z'],['welcome-day7','2026-02-07T12:15:30.000Z']]){
  const before=new Date(Date.parse(due)-1);
  assert.equal(evaluateFlow(kind,state,before).status,'waiting');
  const ready=evaluateFlow(kind,state,due);assert.equal(ready.status,'ready');assert.equal(ready.dueAt,due);
 }
});
test('retention uses three calendar months from delivery and clamps the last day',()=>{
 const state=snapshot();
 const result=evaluateFlow('retention-month3',state,'2026-04-30T12:15:30.000Z');
 assert.equal(result.dueAt,'2026-04-30T12:15:30.000Z');assert.equal(result.status,'ready');
 assert.equal(evaluateFlow('retention-month3',state,'2026-04-30T12:15:29.999Z').status,'waiting');
 state.order.deliveredAt='2026-02-02T09:00:00.000Z';
 assert.equal(evaluateFlow('retention-month3',state,'2026-05-02T09:00:00.000Z').dueAt,'2026-05-02T09:00:00.000Z');
 const leap={...snapshot(),triggeredAt:'2023-11-30T10:00:00Z'};leap.order.deliveredAt=leap.triggeredAt;
 assert.equal(evaluateFlow('retention-month3',leap,'2024-02-29T10:00:00Z').dueAt,'2024-02-29T10:00:00.000Z');
});
test('retention suppresses unpaid, undelivered, cancelled, refunded and unresolved orders',()=>{
 for(const change of [{paid:false},{delivered:false},{cancelled:true},{refunded:true},{disputed:true},{deliveryIncident:true},{deliveredAt:undefined},{refunded:undefined}]){
  const state=snapshot();Object.assign(state.order,change);
  assert.equal(evaluateFlow('retention-month3',state,'2026-06-01T00:00:00Z').status,'suppressed');
 }
});
test('dedupe keys prevent repeating a message while separating kinds, people and events',()=>{
 const state=snapshot(),now='2026-06-01T00:00:00Z';
 const key=evaluateFlow('cart-abandoned',state,now).dedupeKey;
 assert.equal(key,'cart-abandoned:contact-1:event-1');
 state.sentKeys=[key];
 assert.equal(evaluateFlow('cart-abandoned',state,now).status,'suppressed');
 assert.equal(evaluateFlow('welcome-now',state,now).status,'ready');
 assert.equal(evaluateFlow('cart-abandoned',{...state,eventId:'event-2'},now).status,'ready');
 const a=evaluateFlow('cart-abandoned',{...snapshot(),subjectId:'a:b',eventId:'c'},now).dedupeKey;
 const b=evaluateFlow('cart-abandoned',{...snapshot(),subjectId:'a',eventId:'b:c'},now).dedupeKey;
 assert.notEqual(a,b);
});
test('invalid clocks, non-existent dates, malformed ids and inconsistent activity never qualify',()=>{
 for(const now of ['invalid','2026-02-30T12:00:00Z',NaN,Infinity,new Date('invalid')])assert.equal(evaluateFlow('welcome-now',snapshot(),now).status,'suppressed');
 for(const change of [{subjectId:''},{eventId:'  '},{subjectId:'bad\nidentifier'},{subjectId:'\ud800'},{triggeredAt:'2026-02-30T12:00:00Z'},{triggeredAt:undefined},{sentKeys:'invented'}])assert.equal(evaluateFlow('welcome-now',{...snapshot(),...change},'2026-06-01T00:00:00Z').status,'suppressed');
 const state=snapshot();state.cart.updatedAt='2026-01-30T00:00:00Z';assert.equal(evaluateFlow('cart-abandoned',state,'2026-06-01T00:00:00Z').status,'suppressed');
 assert.equal(evaluateFlow('unknown',snapshot(),'2026-06-01T00:00:00Z').status,'suppressed');
});
test('plain-text previews require unsubscribe wiring, use internal links and preserve the chosen colour',()=>{
 for(const {kind} of FLOW_DEFINITIONS){
  const email=renderFlowEmail(kind,{productName:'Housse côtelée',colorName:'Rose'});
  assert.equal(email.previewOnly,true);assert.match(email.unsubscribeText,/désinscription/);assert.match(email.unsubscribeText,/aucun message/);
  assert.ok(email.ctaPath.startsWith('/')&&!email.ctaPath.startsWith('//'));
  assert.doesNotMatch(JSON.stringify(email),/code promo|notre atelier|30 jours|sans frais|Sable|Blanc nuage/i);
 }
 const cart=renderFlowEmail('cart-abandoned',{productName:'Housse côtelée',colorName:'Rose'});
 assert.match(cart.paragraphs.join(' '),/Housse côtelée — Rose/);
 assert.throws(()=>renderFlowEmail('unknown'));
});
