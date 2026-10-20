// ===== Physics Module =====
// Collision detection between shots and meteors

const Physics = (() => {
  function checkShotMeteorCollision(shot, meteor) {
    const dx = shot.x - meteor.x;
    const dy = shot.y - meteor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < meteor.size + 8; // tolerance
  }

  function checkShotMeteorCollisions(shots, meteors) {
    const hits = [];
    for (const shot of shots) {
      for (const meteor of meteors) {
        if (checkShotMeteorCollision(shot, meteor)) {
          hits.push({ shot, meteor });
          break; // one shot hits one meteor
        }
      }
    }
    return hits;
  }

  function checkMeteorBottom(meteor) {
    return meteor.y > 600 + meteor.size;
  }

  return { checkShotMeteorCollision, checkShotMeteorCollisions, checkMeteorBottom };
})();
