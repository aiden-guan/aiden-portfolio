const stars = [
  [7, 13, 4],
  [18, 8, 3],
  [31, 16, 3],
  [45, 7, 4],
  [60, 13, 3],
  [72, 6, 3],
  [85, 17, 4],
  [94, 9, 3],
] as const;

const grass = [
  [1, 34],
  [7, 56],
  [14, 42],
  [21, 68],
  [29, 48],
  [37, 62],
  [45, 38],
  [53, 70],
  [62, 52],
  [70, 64],
  [78, 44],
  [86, 58],
  [94, 36],
] as const;

export function SocialCard() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#0b1522",
        color: "#e8dcc4",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 24,
          border: "4px solid rgba(197, 212, 240, 0.34)",
        }}
      />

      {stars.map(([left, top, size]) => (
        <div
          key={`${left}-${top}`}
          style={{
            position: "absolute",
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            background: "#c5d4f0",
            opacity: 0.66,
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "61%",
          padding: "74px 0 70px 78px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            letterSpacing: "0.24em",
            color: "#c5d4f0",
          }}
        >
          <span>THE MEADOW</span>
          <span
            style={{
              width: 10,
              height: 10,
              margin: "0 16px",
              background: "#c45c26",
            }}
          />
          <span>PORTFOLIO</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 0.94,
              letterSpacing: "-0.065em",
            }}
          >
            AIDEN GUAN
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 590,
              marginTop: 30,
              fontSize: 28,
              lineHeight: 1.35,
              color: "#e8dcc4",
            }}
          >
            Building things people can play with.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 17,
            letterSpacing: "0.08em",
            color: "#8fbf4a",
          }}
        >
          PART THE FIELD&nbsp;&nbsp;→
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "39%",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 326,
            height: 326,
            border: "9px solid #e8dcc4",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 153,
            right: 83,
            width: 18,
            height: 18,
            background: "#c45c26",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 218,
            bottom: 64,
            width: 60,
            height: 224,
            background: "#c5d4f0",
            transform: "rotate(12deg)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          height: 88,
          background: "#245238",
        }}
      >
        {grass.map(([left, height]) => (
          <div
            key={`${left}-${height}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: 0,
              width: 17,
              height,
              background: "#2d7348",
              transform: `rotate(${left % 2 === 0 ? -8 : 8}deg)`,
              transformOrigin: "bottom",
            }}
          />
        ))}
      </div>
    </div>
  );
}
