import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { parseSignature, verifySignature } from "../functions/webhook-mercadopago.js";

const secret = "segredo-de-teste";
const now = Date.UTC(2026, 9, 28, 12, 0, 0);
const ts = String(Math.floor(now / 1000));

function sign(dataId, requestId, timestamp = ts) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  return `ts=${timestamp},v1=${createHmac("sha256", secret).update(manifest).digest("hex")}`;
}

test("lê o header x-signature", () => {
  assert.deepEqual(parseSignature("ts=123, v1=abc"), { ts: "123", v1: "abc" });
  assert.equal(parseSignature("v1=abc"), null);
  assert.equal(parseSignature(null), null);
});

test("aceita uma notificação assinada corretamente", async () => {
  const ok = await verifySignature({ secret, signatureHeader: sign("123456", "req-1"), requestId: "req-1", dataId: "123456", now });
  assert.equal(ok, true);
});

test("recusa assinatura de outro pagamento", async () => {
  const ok = await verifySignature({ secret, signatureHeader: sign("123456", "req-1"), requestId: "req-1", dataId: "999", now });
  assert.equal(ok, false);
});

test("recusa assinatura feita com outro segredo", async () => {
  const ok = await verifySignature({ secret: "outro", signatureHeader: sign("123456", "req-1"), requestId: "req-1", dataId: "123456", now });
  assert.equal(ok, false);
});

test("recusa notificação antiga reenviada", async () => {
  const old = String(Math.floor(now / 1000) - 3600);
  const ok = await verifySignature({ secret, signatureHeader: sign("123456", "req-1", old), requestId: "req-1", dataId: "123456", now });
  assert.equal(ok, false);
});

test("recusa quando o segredo não está configurado", async () => {
  const ok = await verifySignature({ secret: undefined, signatureHeader: sign("123456", "req-1"), requestId: "req-1", dataId: "123456", now });
  assert.equal(ok, false);
});
