export const TransformativePartner = () => {
    return (
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black leading-tight text-balance">
                    A TRANS&shy;FORMATIVE <span className="text-primary">PARTNER</span>
                  </h2>
                </div>
  
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="text-lg">
                  GanzAfrica runs a holistic program that combines training, mentorship, and work placements to prepare African youth for careers in transforming agriculture and land management.
                  </p>
                  <p>
                  Its curriculum blends agriculture, environment, sustainable land use, and land rights, with a strong focus on data literacy and analytical skills so graduates can support evidence-based decisions in public and private institutions.
                  </p>
                  <p>
                  Fellows join a community of mentors, gain real-world experience in government and non-government roles, and build professional networks that help them secure meaningful careers contributing to a healthy, prosperous future for Africa.
                  </p>
                </div>
              </div>
  
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src="/images/GroupMico.jpeg"
                        alt="Learning"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-[4/3] rounded-2xl bg-primary/10 p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-green mb-2">25+</div>
                        <div className="text-sm font-medium">Fellows Trained</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="aspect-[4/3] rounded-2xl bg-accent/30 p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-green mb-2">95%</div>
                        <div className="text-sm font-medium">Job Placement</div>
                      </div>
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden shadow-xl">
                      <img
                        src="/images/Presenting.jpg"
                        alt="Students"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }